import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { AuditLog } from '../models/AuditLog';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOrderStatusEmail } from '../services/email.service';
import { writeAuditLog } from '../middleware/audit';

// ── GET DASHBOARD STATISTICS (aggregation pipelines) ─────────────────
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  // Total Revenue & Order Count (Paid orders & COD confirmed/processing/delivered)
  const salesStats = await Order.aggregate([
    {
      $match: {
        status: { $nin: ['payment-failed', 'cancelled'] },
        paymentStatus: { $in: ['paid', 'pending'] }, // pending is allowed for COD orders
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$total' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const totalSales = salesStats[0]?.totalSales ?? 0;
  const totalOrders = salesStats[0]?.totalOrders ?? 0;

  // Total registered users
  const totalUsers = await User.countDocuments({ role: 'user' });

  // Low stock products alert (stock less than 10 in any weight variant)
  const lowStockProducts = await Product.find({
    isActive: true,
    'weights.stock': { $lt: 10 },
  })
    .select('name weights category')
    .lean();

  // Category wise sales split
  const categorySales = await Order.aggregate([
    { $match: { status: { $nin: ['payment-failed', 'cancelled'] } } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    { $unwind: '$productDetails' },
    {
      $group: {
        _id: '$productDetails.category',
        revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        units: { $sum: '$items.qty' },
      },
    },
  ]);

  // Recent 5 Orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email')
    .lean();

  // Monthly revenue split (past 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySales = await Order.aggregate([
    {
      $match: {
        status: { $nin: ['payment-failed', 'cancelled'] },
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$total' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return sendSuccess(
    res,
    {
      totalSales,
      totalOrders,
      totalUsers,
      categorySales,
      lowStockProducts,
      recentOrders,
      monthlySales,
    },
    'Dashboard statistics fetched successfully'
  );
});

// ── GET ALL USERS (Admin) ────────────────────────────────────────────
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments({ role: 'user' });
  const totalPages = Math.ceil(total / limit);

  const users = await User.find({ role: 'user' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return sendSuccess(res, users, 'Users fetched successfully', 200, {
    page,
    limit,
    total,
    totalPages,
  });
});

// ── TOGGLE USER BLOCK STATUS (Admin + Audit log) ──────────────────────
export const toggleUserBlock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'admin') {
    throw ApiError.forbidden('Cannot block an administrator account');
  }

  const beforeState = { isBlocked: user.isBlocked };
  user.isBlocked = !user.isBlocked;
  await user.save();

  // If blocked, delete their refresh tokens to kick them out instantly
  if (user.isBlocked) {
    const { getRedis } = require('../config/redis');
    const redis = getRedis();
    const keys = await redis.keys(`rt:${user._id}:*`);
    if (keys.length > 0) await redis.del(...keys);
  }

  void writeAuditLog({
    req,
    action: user.isBlocked ? 'USER_BLOCK' : 'USER_UNBLOCK',
    entity: 'user',
    entityId: user._id.toString(),
    before: beforeState,
    after: { isBlocked: user.isBlocked },
  });

  return sendSuccess(
    res,
    user,
    `User has been successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`
  );
});

// ── UPDATE ORDER STATUS (Admin + Timeline + Email update + Audit log) ──
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, trackingNumber, note } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  const beforeState = { status: order.status, trackingNumber: order.trackingNumber };

  // Set values
  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;

  // Add tracking or delivery notes to the timeline entry
  if (note || trackingNumber) {
    // Timeline update is automatically done via Order model pre-save hook,
    // but we can update the last entry note here
    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || (trackingNumber ? `Dispatched with Tracking ID: ${trackingNumber}` : undefined),
    });
  }

  // Handle payments state automatically for deliveries
  if (status === 'delivered') {
    order.paymentStatus = 'paid';
  }

  await order.save();

  // Email status notification async
  const email = order.user ? (await User.findById(order.user).select('email').lean() as any)?.email : order.guestEmail;
  if (email) {
    void sendOrderStatusEmail(email, order._id.toString(), status, trackingNumber);
  }

  void writeAuditLog({
    req,
    action: 'ORDER_STATUS_UPDATE',
    entity: 'order',
    entityId: order._id.toString(),
    before: beforeState,
    after: { status, trackingNumber },
    meta: { note },
  });

  return sendSuccess(res, order, 'Order status updated successfully');
});

// ── GET ADMIN AUDIT LOGS (Admin) ─────────────────────────────────────
export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 30;
  const skip = (page - 1) * limit;

  const total = await AuditLog.countDocuments();
  const totalPages = Math.ceil(total / limit);

  const logs = await AuditLog.find()
    .populate('adminUser', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return sendSuccess(res, logs, 'Audit logs fetched successfully', 200, {
    page,
    limit,
    total,
    totalPages,
  });
});

import { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/Order';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { AuditLog } from '../models/AuditLog';
import { Review } from '../models/Review';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOrderStatusEmail } from '../services/email.service';
import { writeAuditLog } from '../middleware/audit';
import { getRedis, isRedisEnabled } from '../config/redis';
import { assertStatusTransition } from './order.controller';

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const salesStats = await Order.aggregate([
    {
      $match: {
        status: { $nin: ['payment-failed', 'cancelled'] },
        paymentStatus: { $in: ['paid', 'pending'] },
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
  const totalUsers = await User.countDocuments({ role: 'user' });
  const pendingOrders = await Order.countDocuments({
    status: { $in: ['placed', 'confirmed', 'processing'] },
  });
  const totalProducts = await Product.countDocuments({ isActive: true });

  const lowStockProducts = await Product.find({
    isActive: true,
    'weights.stock': { $lt: 10 },
  })
    .select('name weights category')
    .lean();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailyRevenue = await Order.aggregate([
    {
      $match: {
        status: { $nin: ['payment-failed', 'cancelled'] },
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          y: { $year: '$createdAt' },
          m: { $month: '$createdAt' },
          d: { $dayOfMonth: '$createdAt' },
        },
        revenue: { $sum: '$total' },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
  ]);

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

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email')
    .lean();

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
      pendingOrders,
      totalProducts,
      categorySales,
      lowStockProducts,
      dailyRevenue,
      recentOrders,
      monthlySales,
    },
    'Dashboard statistics fetched successfully',
  );
});

export const getAdminOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const status = req.query.status as string | undefined;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { guestEmail: { $regex: search, $options: 'i' } },
      { guestPhone: { $regex: search, $options: 'i' } },
      { trackingNumber: { $regex: search, $options: 'i' } },
      { couponCode: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Order.countDocuments(filter);
  const totalPages = Math.ceil(total / limit) || 1;

  const orders = await Order.find(filter)
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return sendSuccess(res, orders, 'Orders fetched successfully', 200, {
    page,
    limit,
    total,
    totalPages,
  });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const status = String(req.query.status || 'all').toLowerCase(); // all | active | blocked
  const search = String(req.query.search || req.query.q || '').trim();

  const filter: Record<string, unknown> = { role: 'user' };
  // Treat missing isBlocked as active (legacy docs)
  if (status === 'active') {
    filter.isBlocked = { $ne: true };
  } else if (status === 'blocked') {
    filter.isBlocked = true;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const [total, users, activeCount, blockedCount] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select('name email phone isVerified isBlocked addresses createdAt updatedAt avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments({ role: 'user', isBlocked: { $ne: true } }),
    User.countDocuments({ role: 'user', isBlocked: true }),
  ]);

  // Attach light order stats so the admin table shows full customer context
  const userIds = users.map((u) => u._id);
  const spendByUser =
    userIds.length === 0
      ? []
      : await Order.aggregate([
          {
            $match: {
              user: { $in: userIds },
              status: { $nin: ['cancelled', 'payment-failed'] },
            },
          },
          {
            $group: {
              _id: '$user',
              orderCount: { $sum: 1 },
              totalSpent: { $sum: '$total' },
            },
          },
        ]);
  const statsMap = new Map(
    spendByUser.map((s) => [String(s._id), { orderCount: s.orderCount, totalSpent: s.totalSpent }]),
  );

  const data = users.map((u) => ({
    ...u,
    isBlocked: Boolean(u.isBlocked),
    stats: statsMap.get(String(u._id)) || { orderCount: 0, totalSpent: 0 },
  }));

  const totalPages = Math.ceil(total / limit) || 1;

  return sendSuccess(
    res,
    data,
    'Users fetched successfully',
    200,
    {
      page,
      limit,
      total,
      totalPages,
      counts: { active: activeCount, blocked: blockedCount, all: activeCount + blockedCount },
    },
  );
});

/** Full registration details for one customer (admin) */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ _id: req.params.id, role: 'user' })
    .select('-password')
    .lean();

  if (!user) throw ApiError.notFound('Customer not found');

  const userId = user._id;
  const [orderCount, spendAgg] = await Promise.all([
    Order.countDocuments({ user: userId }),
    Order.aggregate([
      {
        $match: {
          user: userId,
          paymentStatus: { $in: ['paid', 'pending'] },
          status: { $nin: ['cancelled', 'payment-failed'] },
        },
      },
      { $group: { _id: null, totalSpent: { $sum: '$total' } } },
    ]),
  ]);

  return sendSuccess(
    res,
    {
      ...user,
      stats: {
        orderCount,
        totalSpent: spendAgg[0]?.totalSpent ?? 0,
      },
    },
    'Customer details fetched',
  );
});

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

  if (user.isBlocked && isRedisEnabled()) {
    const redis = getRedis();
    if (redis) {
      const keys = await redis.keys(`rt:${user._id}:*`);
      if (keys.length > 0) await redis.del(...keys);
    }
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
    `User has been successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`,
  );
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, trackingNumber, note } = req.body as {
    status: OrderStatus;
    trackingNumber?: string;
    note?: string;
  };

  const order = await Order.findById(id);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (status !== order.status) {
    assertStatusTransition(order.status, status);
  }

  const beforeState = { status: order.status, trackingNumber: order.trackingNumber };
  const previousStatus = order.status;

  order.status = status;
  if (trackingNumber !== undefined) {
    order.trackingNumber = trackingNumber || undefined;
  }

  // Always record a timeline entry when status changes (drives user Track Order UI)
  if (status !== previousStatus) {
    const defaultNotes: Record<string, string> = {
      pending: 'Order is pending',
      confirmed: 'Order confirmed',
      processing: 'Order is being packed',
      dispatched: trackingNumber
        ? `Dispatched · Tracking: ${trackingNumber}`
        : 'Order dispatched',
      'out-for-delivery': 'Out for delivery',
      delivered: 'Order delivered',
      cancelled: 'Order cancelled',
      refunded: 'Refund processed',
      'payment-failed': 'Payment failed',
    };
    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note?.trim() || defaultNotes[status] || `Status updated to ${status}`,
    });
  } else if (note?.trim() || trackingNumber) {
    order.timeline.push({
      status,
      timestamp: new Date(),
      note:
        note?.trim() ||
        (trackingNumber ? `Tracking updated: ${trackingNumber}` : undefined),
    });
  }

  if (status === 'delivered' && order.paymentMethod === 'razorpay') {
    order.paymentStatus = 'paid';
  }
  if (status === 'cancelled' && order.paymentStatus === 'pending') {
    order.paymentStatus = 'failed';
  }

  await order.save();

  const email = order.user
    ? (await User.findById(order.user).select('email').lean())?.email
    : order.guestEmail;
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

export const getPendingReviews = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = { isApproved: false };
  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('user', 'name email')
    .populate('product', 'name slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return sendSuccess(res, reviews, 'Pending reviews fetched', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
});

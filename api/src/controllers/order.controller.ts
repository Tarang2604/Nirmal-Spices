import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { Cart } from '../models/Cart';
import { AuditLog } from '../models/AuditLog';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { razorpay } from '../config/razorpay';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../services/email.service';
import { writeAuditLog } from '../middleware/audit';
import crypto from 'crypto';
import { env } from '../config/env';

// ── CREATE ORDER (with Mongoose Transaction + Stock Reservation + Idempotency) ──
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { guestEmail, guestPhone, items, address, paymentMethod, couponCode } = req.body;
  const userId = req.user?._id;

  if (!userId && (!guestEmail || !guestPhone)) {
    throw ApiError.badRequest('Guest checkout requires email and phone number');
  }

  // Idempotency key from header
  const idempotencyKey = req.headers['x-idempotency-key'] as string;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subtotal = 0;
    const orderItems = [];

    // Loop items to validate stock and build order items list
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product || !product.isActive) {
        throw ApiError.notFound(`Product with ID ${item.product} not found or inactive`);
      }

      const variant = product.weights.find((w) => w.weight === item.weight);
      if (!variant) {
        throw ApiError.badRequest(`Variant '${item.weight}' not found for product ${product.name}`);
      }

      if (variant.stock < item.qty) {
        throw ApiError.badRequest(`Insufficient stock for '${product.name}' (${item.weight}). Available: ${variant.stock}`);
      }

      // Reserve stock (decrement immediately inside transaction)
      variant.stock -= item.qty;
      await product.save({ session });

      const itemPrice = variant.price;
      subtotal += itemPrice * item.qty;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        weight: item.weight,
        sku: variant.sku,
        qty: item.qty,
        price: itemPrice,
      });
    }

    // Handle Coupon discount
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true }).session(session);
      if (coupon && coupon.expiresAt > new Date() && coupon.usedCount < coupon.maxUses) {
        if (subtotal >= coupon.minOrder) {
          if (coupon.type === 'percent') {
            discount = Math.floor((subtotal * coupon.value) / 100);
          } else {
            discount = coupon.value;
          }
          // Cap discount
          discount = Math.min(discount, subtotal);
        }
      }
    }

    // Shipping fee (Free over 499)
    const shipping = subtotal - discount >= 499 ? 0 : 40;
    const codCharge = paymentMethod === 'cod' ? 20 : 0;
    const total = subtotal - discount + shipping + codCharge;

    // Create Razorpay Order if payment is Razorpay
    let razorpayOrderId = undefined;
    if (paymentMethod === 'razorpay') {
      try {
        const rpOrder = await razorpay.orders.create({
          amount: Math.round(total * 100), // Razorpay accepts in paise
          currency: 'INR',
          receipt: `receipt_order_${Date.now()}`,
        });
        razorpayOrderId = rpOrder.id;
      } catch (rpErr: any) {
        throw ApiError.internal(`Razorpay order creation failed: ${rpErr.message}`);
      }
    }

    // Create the Order document
    const [order] = await Order.create(
      [
        {
          user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          guestEmail,
          guestPhone,
          items: orderItems,
          address,
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
          razorpayOrderId,
          idempotencyKey,
          couponCode,
          subtotal,
          discount,
          shipping,
          codCharge,
          total,
          status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
        },
      ],
      { session }
    );

    // Increment coupon usage
    if (couponCode && discount > 0) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 }, ...(userId && { $push: { usedBy: userId } }) }
      ).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    // If COD, send confirmation email and clear cart immediately
    if (paymentMethod === 'cod') {
      // Clear cart after successful COD order
      const cartSelector = userId
        ? { userId }
        : { sessionId: req.headers['x-guest-session-id'] as string };
      void Cart.findOneAndDelete(cartSelector);

      const email = userId ? req.user?.email : guestEmail;
      if (email) void sendOrderConfirmationEmail(email, order);
    }

    return sendSuccess(res, {
      orderId: order._id,
      paymentMethod,
      razorpayOrderId,
      total,
      key: paymentMethod === 'razorpay' ? env.RAZORPAY_KEY_ID : undefined,
    }, 'Order created successfully');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// ── VERIFY PAYMENT SIGNATURE (Client callback verify) ─────────────────────────
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  const text = razorpayOrderId + '|' + razorpayPaymentId;
  const generatedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(generatedSignature),
    Buffer.from(razorpaySignature)
  );

  if (!isSignatureValid) {
    throw ApiError.badRequest('Invalid payment signature');
  }

  // Update order status
  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.status === 'pending') {
    order.status = 'confirmed';
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    // Clear cart
    const userCartSelector = order.user ? { userId: order.user } : { sessionId: req.headers['x-guest-session-id'] as string };
    await Cart.findOneAndDelete(userCartSelector);

    // Send confirmation email
    const email = order.user ? req.user?.email : order.guestEmail;
    if (email) void sendOrderConfirmationEmail(email, order);
  }

  return sendSuccess(res, { orderId: order._id }, 'Payment verified successfully');
});

// ── RAZORPAY WEBHOOK (Source of truth payment reconciliation) ─────────────
export const handleRazorpayWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string | undefined;
  if (!signature) {
    throw ApiError.forbidden('Signature missing');
  }

  // Verify signature using raw body buffer
  const rawBody = (req as any).rawBody; // needs middleware setup in server.ts
  if (!rawBody) {
    throw ApiError.internal('Raw request body is not available for verification');
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    throw ApiError.forbidden('Invalid webhook signature');
  }

  const eventObj = req.body;
  const eventId = eventObj.id;

  // Idempotency: Prevent duplicate webhook event processing
  const { getRedis } = require('../config/redis');
  const redis = getRedis();
  const webhookKey = `webhook:${eventId}`;
  const isDuplicate = await redis.exists(webhookKey);

  if (isDuplicate) {
    return res.status(200).json({ success: true, message: 'Event already processed' });
  }
  // Store webhook key for 24h
  await redis.set(webhookKey, '1', 'EX', 86400);

  const payload = eventObj.payload;

  if (eventObj.event === 'order.paid') {
    const razorpayOrderId = payload.order.entity.id;
    const paymentEntity = payload.payment.entity;

    const order = await Order.findOne({ razorpayOrderId });
    if (order && order.status === 'pending') {
      order.status = 'confirmed';
      order.paymentStatus = 'paid';
      order.razorpayPaymentId = paymentEntity.id;
      order.isWebhookConfirmed = true;
      await order.save();

      // Clear cart
      const cartSelector = order.user ? { userId: order.user } : { guestEmail: order.guestEmail };
      await Cart.findOneAndDelete(cartSelector);

      // Email confirmation
      const email = order.user ? (await mongoose.model('User').findById(order.user).select('email').lean() as any)?.email : order.guestEmail;
      if (email) void sendOrderConfirmationEmail(email, order);

      // Log webhook action
      void AuditLog.create({
        adminUser: new mongoose.Types.ObjectId(), // system-level action
        action: 'WEBHOOK_RECEIVED',
        entity: 'order',
        entityId: order._id,
        meta: { event: eventObj.event, razorpayOrderId },
      });
    }
  } else if (eventObj.event === 'payment.failed') {
    const razorpayOrderId = payload.payment.entity.order_id;
    
    // Find the order and release reserved stock
    const order = await Order.findOne({ razorpayOrderId });
    if (order && order.status === 'pending') {
      order.status = 'payment-failed';
      order.paymentStatus = 'failed';
      await order.save();

      // Restore product stock
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product, 'weights.weight': item.weight },
          { $inc: { 'weights.$.stock': item.qty } }
        );
      }
    }
  }

  return res.status(200).json({ success: true });
});

// ── GET USER ORDERS ──────────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments({ user: req.user._id });
  const totalPages = Math.ceil(total / limit);

  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return sendSuccess(res, orders, 'Orders fetched', 200, { page, limit, total, totalPages });
});

// ── GET SINGLE ORDER DETAILS ─────────────────────────────────────────
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate({
    path: 'items.product',
    select: 'name slug images category',
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Security check: Only owner or admin can view
  if (req.user?.role !== 'admin' && order.user?.toString() !== req.user?._id) {
    throw ApiError.forbidden('You do not have permission to view this order');
  }

  return sendSuccess(res, order);
});

// ── CANCEL ORDER (with stock restoration) ─────────────────────────────
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await Order.findById(id);

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Auth ownership check
  if (req.user?.role !== 'admin' && order.user?.toString() !== req.user?._id) {
    throw ApiError.forbidden('You cannot cancel this order');
  }

  if (order.status !== 'pending' && order.status !== 'confirmed') {
    throw ApiError.badRequest(`Order cannot be cancelled. Current status is ${order.status}`);
  }

  order.status = 'cancelled';
  await order.save();

  // Restore stock
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product, 'weights.weight': item.weight },
      { $inc: { 'weights.$.stock': item.qty } }
    );
  }

  // Email status update
  const email = order.user ? req.user?.email : order.guestEmail;
  if (email) void sendOrderStatusEmail(email, order._id.toString(), 'cancelled');

  // Log action
  if (req.user?.role === 'admin') {
    void writeAuditLog({
      req,
      action: 'ORDER_CANCEL',
      entity: 'order',
      entityId: order._id.toString(),
      before: { status: 'confirmed' },
      after: { status: 'cancelled' },
    });
  }

  return sendSuccess(res, order, 'Order cancelled and stock restored successfully');
});

// ── GET GUEST ORDER (Public — verified by email or phone) ────────────
export const getGuestOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, phone } = req.query;

  if (!email && !phone) {
    throw ApiError.badRequest('Email or phone is required to verify guest order ownership');
  }

  const order = await Order.findById(id).lean();
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Guest orders only — if order has a user, deny guest lookup
  if (order.user) {
    throw ApiError.forbidden('This order is linked to a registered account. Please log in to view it.');
  }

  // Verify ownership via email or phone
  const emailMatch = email && order.guestEmail === (email as string).toLowerCase();
  const phoneMatch = phone && order.guestPhone === (phone as string);

  if (!emailMatch && !phoneMatch) {
    throw ApiError.forbidden('Email or phone does not match the order record');
  }

  return sendSuccess(res, order, 'Guest order fetched successfully');
});

// ── GET ALL ORDERS (Admin — with filters, sorting, pagination) ────────
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  // Date range filter
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from as string);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to as string);
  }

  // Search by order ID prefix or guest email
  if (req.query.search) {
    const searchTerm = req.query.search as string;
    filter.$or = [
      { guestEmail: { $regex: searchTerm, $options: 'i' } },
      { guestPhone: { $regex: searchTerm, $options: 'i' } },
    ];
    // Also try matching by ObjectId if it looks like one
    if (/^[0-9a-fA-F]{24}$/.test(searchTerm)) {
      filter.$or.push({ _id: searchTerm });
    }
  }

  const total = await Order.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const orders = await Order.find(filter)
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return sendSuccess(res, orders, 'All orders fetched', 200, { page, limit, total, totalPages });
});

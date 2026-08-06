import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../models/Order';
import { Product } from '../models/Product';
import { Coupon, calculateCouponDiscount } from '../models/Coupon';
import { Cart } from '../models/Cart';
import { User } from '../models/User';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { razorpay } from '../config/razorpay';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../services/email.service';
import { writeAuditLog } from '../middleware/audit';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { getRedis, isRedisEnabled } from '../config/redis';
import { logger } from '../utils/logger';
import {
  calculateDeliveryCharge,
  calculateFeeAmount,
  getOrCreateStoreSettings,
} from '../models/StoreSettings';

/** Apply the same coupon rules as POST /coupons/validate */
async function applyCouponDiscount(
  code: string,
  subtotal: number,
  userId: string | undefined,
  session: mongoose.ClientSession,
): Promise<{ discount: number; couponCode: string }> {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true }).session(session);
  if (!coupon) {
    throw ApiError.badRequest('Invalid coupon code');
  }
  const now = new Date();
  if (coupon.startsAt > now) {
    throw ApiError.badRequest('Coupon is not active yet');
  }
  if (coupon.expiresAt < now) {
    throw ApiError.badRequest('Coupon has expired');
  }
  if (coupon.usedCount >= coupon.maxUses) {
    throw ApiError.badRequest('Coupon usage limit reached');
  }
  if (subtotal < coupon.minOrder) {
    throw ApiError.badRequest(`Minimum order amount of ₹${coupon.minOrder} required to use this coupon`);
  }
  if (userId && coupon.oncePerUser !== false) {
    const alreadyUsed = coupon.usedBy.some((uid) => uid.toString() === String(userId));
    if (alreadyUsed) {
      throw ApiError.badRequest('You have already used this coupon code');
    }
  }

  const discount = calculateCouponDiscount(coupon, subtotal);
  return { discount, couponCode: coupon.code };
}

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { guestEmail, guestPhone, items, address, paymentMethod, couponCode } = req.body;
  const userId = req.user?._id;
  const guestSessionId =
    typeof req.headers['x-guest-session-id'] === 'string'
      ? req.headers['x-guest-session-id'].trim()
      : undefined;

  if (!userId && (!guestEmail || !guestPhone)) {
    throw ApiError.badRequest('Guest checkout requires email and phone number');
  }

  if (couponCode && userId) {
    const user = await User.findById(userId).select('isVerified');
    if (user && !user.isVerified) {
      throw ApiError.forbidden('Please verify your email before applying coupons');
    }
  }

  const idempotencyKey =
    (typeof req.headers['x-idempotency-key'] === 'string' && req.headers['x-idempotency-key'].trim()) ||
    uuidv4();

  const existing = await Order.findOne({ idempotencyKey }).lean();
  if (existing) {
    return sendSuccess(
      res,
      {
        orderId: existing._id,
        paymentMethod: existing.paymentMethod,
        razorpayOrderId: existing.razorpayOrderId,
        total: existing.total,
        key: existing.paymentMethod === 'razorpay' ? env.RAZORPAY_KEY_ID : undefined,
      },
      'Order created successfully',
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subtotal = 0;
    const orderItems = [];

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
        throw ApiError.badRequest(
          `Insufficient stock for '${product.name}' (${item.weight}). Available: ${variant.stock}`,
        );
      }

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

    let discount = 0;
    let appliedCouponCode: string | undefined;
    if (couponCode) {
      if (!userId) {
        throw ApiError.unauthorized('Login required to apply coupons');
      }
      const applied = await applyCouponDiscount(couponCode, subtotal, userId, session);
      discount = applied.discount;
      appliedCouponCode = applied.couponCode;
    }

    const settings = await getOrCreateStoreSettings();
    const feeBase = Math.max(0, subtotal - discount);
    const shipping = calculateDeliveryCharge(settings, feeBase);
    // Online payment only — COD charge always 0
    const codCharge = 0;

    if (paymentMethod !== 'razorpay') {
      throw ApiError.badRequest('Only online payment (Razorpay) is supported');
    }

    const commission = calculateFeeAmount(
      settings.commissionType,
      settings.commissionValue,
      feeBase,
    );
    const platformFee = calculateFeeAmount(
      settings.platformFeeType,
      settings.platformFeeValue,
      feeBase,
    );

    const total = subtotal - discount + shipping + codCharge + commission + platformFee;

    let razorpayOrderId: string | undefined;
    if (paymentMethod === 'razorpay') {
      try {
        const rpOrder = await razorpay.orders.create({
          amount: Math.round(total * 100),
          currency: 'INR',
          receipt: `receipt_order_${Date.now()}`,
        });
        razorpayOrderId = rpOrder.id;
      } catch (rpErr: any) {
        throw ApiError.internal(`Razorpay order creation failed: ${rpErr.message}`);
      }
    }

    const [order] = await Order.create(
      [
        {
          user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          guestEmail,
          guestPhone,
          guestSessionId,
          items: orderItems,
          address,
          paymentMethod,
          paymentStatus: 'pending',
          razorpayOrderId,
          idempotencyKey,
          couponCode: appliedCouponCode,
          subtotal,
          discount,
          shipping,
          codCharge,
          commission,
          platformFee,
          feeSnapshot: {
            commissionType: settings.commissionType,
            commissionValue: settings.commissionValue,
            platformFeeType: settings.platformFeeType,
            platformFeeValue: settings.platformFeeValue,
            deliveryCharge: settings.deliveryCharge,
            freeDeliveryMin: settings.freeDeliveryMin,
          },
          total,
          status: 'pending',
        },
      ],
      { session },
    );

    // Attach initial track note
    const initialNote = 'Order created — awaiting Razorpay payment';
    if (order.timeline?.length) {
      order.timeline[order.timeline.length - 1].note = initialNote;
      await order.save({ session });
    }

    if (appliedCouponCode && discount > 0) {
      await Coupon.findOneAndUpdate(
        { code: appliedCouponCode },
        { $inc: { usedCount: 1 }, ...(userId && { $push: { usedBy: userId } }) },
      ).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    return sendSuccess(
      res,
      {
        orderId: order._id,
        paymentMethod: 'razorpay',
        razorpayOrderId,
        total,
        key: env.RAZORPAY_KEY_ID,
      },
      'Order created successfully',
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  const text = `${razorpayOrderId}|${razorpayPaymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  if (
    typeof razorpaySignature !== 'string' ||
    generatedSignature.length !== razorpaySignature.length ||
    !crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(razorpaySignature))
  ) {
    throw ApiError.badRequest('Invalid payment signature');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
    throw ApiError.badRequest('Payment does not match this order');
  }

  if (order.status === 'pending') {
    order.status = 'confirmed';
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    if (order.timeline?.length) {
      order.timeline[order.timeline.length - 1].note = 'Razorpay payment verified';
      await order.save();
    }

    const guestSessionHeader =
      typeof req.headers['x-guest-session-id'] === 'string'
        ? req.headers['x-guest-session-id']
        : undefined;
    const cartSelector = order.user
      ? { userId: order.user }
      : { sessionId: order.guestSessionId || guestSessionHeader };
    if (cartSelector.userId || (cartSelector as { sessionId?: string }).sessionId) {
      await Cart.findOneAndDelete(cartSelector);
    }

    let email = order.guestEmail;
    if (order.user) {
      email = req.user?.email || (await User.findById(order.user).select('email').lean())?.email;
    }
    if (email) void sendOrderConfirmationEmail(email, order);
  }

  return sendSuccess(res, { orderId: order._id }, 'Payment verified successfully');
});

export const handleRazorpayWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string | undefined;
  if (!signature) {
    throw ApiError.forbidden('Signature missing');
  }

  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    throw ApiError.internal('Raw request body is not available for verification');
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (
    expectedSignature.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
  ) {
    throw ApiError.forbidden('Invalid webhook signature');
  }

  const eventObj = req.body;
  const eventId = eventObj.id;

  if (isRedisEnabled()) {
    const redis = getRedis();
    if (redis) {
      const webhookKey = `webhook:${eventId}`;
      const isDuplicate = await redis.exists(webhookKey);
      if (isDuplicate) {
        return res.status(200).json({ success: true, message: 'Event already processed' });
      }
      await redis.set(webhookKey, '1', 'EX', 86400);
    }
  }

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

      const cartSelector = order.user
        ? { userId: order.user }
        : order.guestSessionId
          ? { sessionId: order.guestSessionId }
          : null;
      if (cartSelector) await Cart.findOneAndDelete(cartSelector);

      const email = order.user
        ? (await User.findById(order.user).select('email').lean())?.email
        : order.guestEmail;
      if (email) void sendOrderConfirmationEmail(email, order);

      logger.info({ orderId: order._id, event: eventObj.event }, 'Razorpay webhook order.paid processed');
    }
  } else if (eventObj.event === 'payment.failed') {
    const razorpayOrderId = payload.payment.entity.order_id;
    const order = await Order.findOne({ razorpayOrderId });
    if (order && order.status === 'pending') {
      order.status = 'payment-failed';
      order.paymentStatus = 'failed';
      await order.save();

      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product, 'weights.weight': item.weight },
          { $inc: { 'weights.$.stock': item.qty } },
        );
      }
    }
  }

  return res.status(200).json({ success: true });
});

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

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const guestEmail = typeof req.query.email === 'string' ? req.query.email.toLowerCase().trim() : undefined;

  const order = await Order.findById(id).populate({
    path: 'items.product',
    select: 'name slug images category',
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  const isAdmin = req.user?.role === 'admin';
  const isOwner = order.user?.toString() === req.user?._id;
  const isGuestMatch =
    !order.user &&
    !!guestEmail &&
    !!order.guestEmail &&
    order.guestEmail.toLowerCase() === guestEmail;

  if (!isAdmin && !isOwner && !isGuestMatch) {
    if (!req.user && !guestEmail) {
      throw ApiError.unauthorized('Authentication or guest email required to view this order');
    }
    throw ApiError.forbidden('You do not have permission to view this order');
  }

  return sendSuccess(res, order);
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await Order.findById(id);

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (req.user?.role !== 'admin' && order.user?.toString() !== req.user?._id) {
    throw ApiError.forbidden('You cannot cancel this order');
  }

  if (order.status !== 'pending' && order.status !== 'confirmed') {
    throw ApiError.badRequest(`Order cannot be cancelled. Current status is ${order.status}`);
  }

  const previousStatus = order.status;
  order.status = 'cancelled';
  await order.save();

  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product, 'weights.weight': item.weight },
      { $inc: { 'weights.$.stock': item.qty } },
    );
  }

  const email = order.user
    ? req.user?.email || (await User.findById(order.user).select('email').lean())?.email
    : order.guestEmail;
  if (email) void sendOrderStatusEmail(email, order._id.toString(), 'cancelled');

  if (req.user?.role === 'admin') {
    void writeAuditLog({
      req,
      action: 'ORDER_CANCEL',
      entity: 'order',
      entityId: order._id.toString(),
      before: { status: previousStatus },
      after: { status: 'cancelled' },
    });
  }

  return sendSuccess(res, order, 'Order cancelled and stock restored successfully');
});

/** Allowed admin status transitions — flexible for ops (any forward / cancel / refund paths) */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'processing', 'dispatched', 'out-for-delivery', 'delivered', 'cancelled', 'payment-failed'],
  confirmed: ['processing', 'dispatched', 'out-for-delivery', 'delivered', 'cancelled'],
  processing: ['dispatched', 'out-for-delivery', 'delivered', 'cancelled'],
  dispatched: ['out-for-delivery', 'delivered', 'cancelled'],
  'out-for-delivery': ['delivered', 'cancelled'],
  delivered: ['refunded'],
  cancelled: ['refunded'],
  'payment-failed': ['pending', 'cancelled'],
  refunded: [],
};

export function assertStatusTransition(from: OrderStatus, to: OrderStatus): void {
  const allowed = ORDER_STATUS_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw ApiError.badRequest(`Cannot transition order from '${from}' to '${to}'`);
  }
}

export const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
});

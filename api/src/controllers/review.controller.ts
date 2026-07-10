import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { writeAuditLog } from '../middleware/audit';

// ── SUBMIT A PRODUCT REVIEW ──────────────────────────────────────────
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { productId } = req.params;
  const { rating, title, body } = req.body;
  const userId = req.user._id;

  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ product: productId, user: userId });
  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this product');
  }

  // Verified Purchase Check: Check if user has a delivered order containing this product
  const deliveredOrder = await Order.findOne({
    user: userId,
    status: 'delivered',
    'items.product': productId,
  });

  const review = await Review.create({
    product: productId,
    user: userId,
    order: deliveredOrder ? deliveredOrder._id : undefined,
    rating,
    title,
    body,
    isVerifiedPurchase: !!deliveredOrder,
    isApproved: false, // auto-moderation: reviews require admin approval
  });

  return sendSuccess(
    res,
    review,
    'Review submitted successfully! It will be visible once approved by an administrator.',
    201
  );
});

// ── GET APPROVED REVIEWS FOR A PRODUCT ───────────────────────────────
export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const total = await Review.countDocuments({ product: productId, isApproved: true });
  const totalPages = Math.ceil(total / limit);

  const reviews = await Review.find({ product: productId, isApproved: true })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return sendSuccess(res, reviews, 'Reviews fetched successfully', 200, {
    page,
    limit,
    total,
    totalPages,
  });
});

// ── APPROVE REVIEW (Admin) ───────────────────────────────────────────
export const approveReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  review.isApproved = true;
  await review.save();

  // Recalculate Product average rating
  const stats = await Review.aggregate([
    { $match: { product: review.product, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(review.product, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }

  // Clear product caches since average rating changed
  const product = await Product.findById(review.product).select('slug');
  if (product) {
    const { getRedis } = require('../config/redis');
    const redis = getRedis();
    await redis.del(`product:${product.slug}`);
    await redis.keys('products:*').then(async (keys: string[]) => {
      if (keys.length > 0) await redis.del(...keys);
    });
  }

  void writeAuditLog({
    req,
    action: 'REVIEW_APPROVE',
    entity: 'review',
    entityId: review._id.toString(),
    after: { isApproved: true },
  });

  return sendSuccess(res, review, 'Review approved successfully');
});

// ── DELETE REVIEW (Admin or Owner) ───────────────────────────────────
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  // Permission check: admin or the user who wrote the review
  if (req.user?.role !== 'admin' && review.user.toString() !== req.user?._id) {
    throw ApiError.forbidden('You do not have permission to delete this review');
  }

  const beforeState = review.toObject();
  await review.deleteOne();

  // Recalculate average rating for product
  const stats = await Review.aggregate([
    { $match: { product: review.product, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(review.product, {
    rating: stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
    reviewCount: stats.length > 0 ? stats[0].count : 0,
  });

  // Clear product cache
  const product = await Product.findById(review.product).select('slug');
  if (product) {
    const { getRedis } = require('../config/redis');
    const redis = getRedis();
    await redis.del(`product:${product.slug}`);
    await redis.keys('products:*').then(async (keys: string[]) => {
      if (keys.length > 0) await redis.del(...keys);
    });
  }

  if (req.user?.role === 'admin') {
    void writeAuditLog({
      req,
      action: 'REVIEW_DELETE',
      entity: 'review',
      entityId: review._id.toString(),
      before: beforeState,
    });
  }

  return sendSuccess(res, null, 'Review deleted successfully');
});

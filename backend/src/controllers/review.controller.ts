import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { writeAuditLog } from '../middleware/audit';
import { getRedis, isRedisEnabled } from '../config/redis';

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { productId } = req.params;
  const { rating, title, body } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId).select('isVerified');
  if (user && !user.isVerified) {
    throw ApiError.forbidden('Please verify your email before submitting a review');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const existingReview = await Review.findOne({ product: productId, user: userId });
  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this product');
  }

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
    isApproved: false,
  });

  return sendSuccess(
    res,
    review,
    'Review submitted successfully! It will be visible once approved by an administrator.',
    201
  );
});

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

export const approveReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  review.isApproved = true;
  await review.save();

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

  const product = await Product.findById(review.product).select('slug');
  if (product && isRedisEnabled()) {
    const redis = getRedis();
    if (redis) {
      await redis.del(`product:${product.slug}`);
      const keys = await redis.keys('products:*');
      if (keys.length > 0) await redis.del(...keys);
    }
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

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  if (req.user?.role !== 'admin' && review.user.toString() !== req.user?._id) {
    throw ApiError.forbidden('You do not have permission to delete this review');
  }

  const beforeState = review.toObject();
  await review.deleteOne();

  const stats = await Review.aggregate([
    { $match: { product: review.product, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(review.product, {
    rating: stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
    reviewCount: stats.length > 0 ? stats[0].count : 0,
  });

  const product = await Product.findById(review.product).select('slug');
  if (product && isRedisEnabled()) {
    const redis = getRedis();
    if (redis) {
      await redis.del(`product:${product.slug}`);
      const keys = await redis.keys('products:*');
      if (keys.length > 0) await redis.del(...keys);
    }
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

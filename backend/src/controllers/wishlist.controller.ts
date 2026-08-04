import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const user = await User.findById(req.user._id)
    .populate({
      path: 'wishlist',
      match: { isActive: true },
      select: 'name slug images weights category badge rating salePrice',
    })
    .lean();

  if (!user) throw ApiError.notFound('User not found');

  return sendSuccess(res, user.wishlist || [], 'Wishlist fetched');
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw ApiError.badRequest('Invalid product id');
  }

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw ApiError.notFound('Product not found');

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { wishlist: product._id },
  });

  return sendSuccess(res, { productId: product._id }, 'Added to wishlist');
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { productId } = req.params;

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { wishlist: productId },
  });

  return sendSuccess(res, { productId }, 'Removed from wishlist');
});

export const toggleWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw ApiError.badRequest('Invalid product id');
  }

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw ApiError.notFound('Product not found');

  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound('User not found');

  const exists = user.wishlist.some((id) => id.toString() === productId);
  if (exists) {
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  } else {
    user.wishlist.push(product._id as mongoose.Types.ObjectId);
  }
  await user.save();

  return sendSuccess(
    res,
    { productId, inWishlist: !exists, ids: user.wishlist.map((id) => id.toString()) },
    exists ? 'Removed from wishlist' : 'Added to wishlist',
  );
});

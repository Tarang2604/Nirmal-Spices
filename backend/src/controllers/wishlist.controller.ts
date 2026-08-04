import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

// ── GET WISHLIST ─────────────────────────────────────────────────────
export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const user = await User.findById(req.user._id)
    .populate({
      path: 'wishlist',
      select: 'name slug category images weights badge rating reviewCount isActive salePrice',
      match: { isActive: true }, // Only return active products
    })
    .lean();

  if (!user) throw ApiError.notFound('User not found');

  return sendSuccess(res, user.wishlist || [], 'Wishlist fetched successfully');
});

// ── TOGGLE WISHLIST (Add if not present, Remove if already in list) ─
export const toggleWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const { productId } = req.body;
  if (!productId) {
    throw ApiError.badRequest('Product ID is required');
  }

  // Confirm product exists
  const product = await Product.findById(productId).select('name isActive').lean();
  if (!product || !product.isActive) {
    throw ApiError.notFound('Product not found or inactive');
  }

  const user = await User.findById(req.user._id).select('wishlist');
  if (!user) throw ApiError.notFound('User not found');

  const productObjectId = productId;
  const isAlreadyWishlisted = user.wishlist.some(
    (id) => id.toString() === productObjectId
  );

  if (isAlreadyWishlisted) {
    // Remove from wishlist
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productObjectId) as any;
    await user.save();
    return sendSuccess(res, { added: false, productId }, `${product.name} removed from wishlist`);
  } else {
    // Add to wishlist
    user.wishlist.push(productObjectId as any);
    await user.save();
    return sendSuccess(res, { added: true, productId }, `${product.name} added to wishlist`);
  }
});

// ── ADD TO WISHLIST (Params) ──────────────────────────────────────────
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

// ── REMOVE FROM WISHLIST (Params) ─────────────────────────────────────
export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { productId } = req.params;

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { wishlist: productId },
  });

  return sendSuccess(res, { productId }, 'Removed from wishlist');
});

// ── CLEAR WISHLIST ───────────────────────────────────────────────────
export const clearWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  await User.findByIdAndUpdate(req.user._id, { $set: { wishlist: [] } });

  return sendSuccess(res, [], 'Wishlist cleared');
});

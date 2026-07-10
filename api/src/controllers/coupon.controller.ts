import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { writeAuditLog } from '../middleware/audit';

// ── VALIDATE COUPON ──────────────────────────────────────────────────
export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, cartAmount } = req.body;
  const userId = req.user?._id;

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) {
    throw ApiError.badRequest('Invalid coupon code');
  }

  // Check expiry
  if (coupon.expiresAt < new Date()) {
    throw ApiError.badRequest('Coupon has expired');
  }

  // Check usage limit
  if (coupon.usedCount >= coupon.maxUses) {
    throw ApiError.badRequest('Coupon usage limit reached');
  }

  // Check min order
  if (cartAmount < coupon.minOrder) {
    throw ApiError.badRequest(`Minimum order amount of ₹${coupon.minOrder} required to use this coupon`);
  }

  // Check if user already used this coupon (if logged in)
  if (userId) {
    const alreadyUsed = coupon.usedBy.some((uid) => uid.toString() === userId);
    if (alreadyUsed) {
      throw ApiError.badRequest('You have already used this coupon code');
    }
  }

  // Calculate discount value
  let discount = 0;
  if (coupon.type === 'percent') {
    discount = Math.floor((cartAmount * coupon.value) / 100);
  } else {
    discount = coupon.value;
  }

  // Ensure discount doesn't exceed order amount
  discount = Math.min(discount, cartAmount);

  return sendSuccess(res, {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
  }, 'Coupon is valid');
});

// ── CREATE COUPON (Admin) ────────────────────────────────────────────
export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, type, value, minOrder, maxUses, expiresAt, isActive, description } = req.body;

  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw ApiError.conflict('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code,
    type,
    value,
    minOrder,
    maxUses,
    expiresAt: new Date(expiresAt),
    isActive,
    description,
  });

  void writeAuditLog({
    req,
    action: 'COUPON_CREATE',
    entity: 'coupon',
    entityId: coupon._id.toString(),
    after: coupon.toObject(),
  });

  return sendSuccess(res, coupon, 'Coupon created successfully', 201);
});

// ── GET ALL COUPONS (Admin) ──────────────────────────────────────────
export const getCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  return sendSuccess(res, coupons);
});

// ── DELETE COUPON (Admin) ────────────────────────────────────────────
export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw ApiError.notFound('Coupon not found');
  }

  const beforeState = coupon.toObject();
  await coupon.deleteOne();

  void writeAuditLog({
    req,
    action: 'COUPON_DELETE',
    entity: 'coupon',
    entityId: coupon._id.toString(),
    before: beforeState,
  });

  return sendSuccess(res, null, 'Coupon deleted successfully');
});

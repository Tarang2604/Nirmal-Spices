import { Request, Response } from 'express';
import { Coupon, calculateCouponDiscount } from '../models/Coupon';
import { User } from '../models/User';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { writeAuditLog } from '../middleware/audit';

function endOfDay(dateInput: string | Date): Date {
  const d = new Date(dateInput);
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    d.setHours(23, 59, 59, 999);
  }
  return d;
}

function startOfDay(dateInput: string | Date): Date {
  const d = new Date(dateInput);
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

const PUBLIC_FIELDS = [
  'code',
  'title',
  'description',
  'type',
  'value',
  'maxDiscount',
  'minOrder',
  'expiresAt',
  'startsAt',
] as const;

// ── LIST AVAILABLE COUPONS (Checkout / storefront) ───────────────────
export const getAvailableCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const now = new Date();
  const coupons = await Coupon.find({
    isActive: true,
    expiresAt: { $gt: now },
    $and: [
      {
        $or: [
          { startsAt: { $exists: false } },
          { startsAt: null },
          { startsAt: { $lte: now } },
        ],
      },
      {
        $expr: { $lt: ['$usedCount', '$maxUses'] },
      },
    ],
  })
    .select(PUBLIC_FIELDS.join(' '))
    .sort({ createdAt: -1 })
    .lean();

  return sendSuccess(res, coupons, 'Available coupons fetched');
});

// ── VALIDATE COUPON ──────────────────────────────────────────────────
export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, cartAmount } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw ApiError.unauthorized('Login required to apply coupons');
  }

  const user = await User.findById(userId).select('isVerified');
  if (user && !user.isVerified) {
    throw ApiError.forbidden('Please verify your email before applying coupons');
  }

  const coupon = await Coupon.findOne({ code: String(code).toUpperCase(), isActive: true });
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
  if (cartAmount < coupon.minOrder) {
    throw ApiError.badRequest(
      `Minimum order amount of ₹${coupon.minOrder} required to use this coupon`,
    );
  }

  if (coupon.oncePerUser !== false) {
    const alreadyUsed = coupon.usedBy.some((uid) => uid.toString() === String(userId));
    if (alreadyUsed) {
      throw ApiError.badRequest('You have already used this coupon code');
    }
  }

  const discount = calculateCouponDiscount(coupon, Number(cartAmount));

  return sendSuccess(
    res,
    {
      code: coupon.code,
      title: coupon.title,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      minOrder: coupon.minOrder,
      discount,
    },
    'Coupon is valid',
  );
});

// ── CREATE COUPON (Admin) ────────────────────────────────────────────
export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const {
    code,
    title,
    type,
    value,
    maxDiscount,
    minOrder,
    maxUses,
    oncePerUser,
    startsAt,
    expiresAt,
    isActive,
    description,
  } = req.body;

  const normalizedCode = String(code).toUpperCase().trim();
  const existingCoupon = await Coupon.findOne({ code: normalizedCode });
  if (existingCoupon) {
    throw ApiError.conflict('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: normalizedCode,
    title: title || normalizedCode,
    description: description || '',
    type,
    value,
    maxDiscount: maxDiscount || undefined,
    minOrder: minOrder ?? 0,
    maxUses: maxUses ?? 1000,
    oncePerUser: oncePerUser !== false,
    startsAt: startsAt ? startOfDay(startsAt) : new Date(),
    expiresAt: endOfDay(expiresAt),
    isActive: isActive !== false,
    createdBy: req.user?._id,
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

// ── UPDATE COUPON (Admin) ────────────────────────────────────────────
export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw ApiError.notFound('Coupon not found');

  const before = coupon.toObject();
  const body = req.body;

  if (body.title !== undefined) coupon.title = String(body.title).trim();
  if (body.description !== undefined) coupon.description = String(body.description);
  if (body.type !== undefined) coupon.type = body.type;
  if (body.value !== undefined) coupon.value = Number(body.value);
  if (body.maxDiscount !== undefined) {
    coupon.maxDiscount = body.maxDiscount === null || body.maxDiscount === ''
      ? undefined
      : Number(body.maxDiscount);
  }
  if (body.minOrder !== undefined) coupon.minOrder = Number(body.minOrder);
  if (body.maxUses !== undefined) coupon.maxUses = Number(body.maxUses);
  if (body.oncePerUser !== undefined) coupon.oncePerUser = Boolean(body.oncePerUser);
  if (body.isActive !== undefined) coupon.isActive = Boolean(body.isActive);
  if (body.startsAt !== undefined) coupon.startsAt = startOfDay(body.startsAt);
  if (body.expiresAt !== undefined) coupon.expiresAt = endOfDay(body.expiresAt);

  await coupon.save();

  void writeAuditLog({
    req,
    action: 'COUPON_UPDATE',
    entity: 'coupon',
    entityId: coupon._id.toString(),
    before,
    after: coupon.toObject(),
  });

  return sendSuccess(res, coupon, 'Coupon updated successfully');
});

// ── GET ALL COUPONS (Admin) ──────────────────────────────────────────
export const getCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  return sendSuccess(res, coupons, 'Coupons fetched');
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

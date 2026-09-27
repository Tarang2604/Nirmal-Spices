import mongoose, { Document, Schema } from 'mongoose';

export type CouponType = 'percent' | 'flat';

export interface ICoupon extends Document {
  code: string;
  title: string;
  description?: string;
  type: CouponType;
  value: number;
  /** Cap on discount amount (useful for percent coupons) */
  maxDiscount?: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  usedBy: mongoose.Types.ObjectId[];
  oncePerUser: boolean;
  startsAt: Date;
  expiresAt: Date;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
      match: [/^[A-Z0-9_-]+$/, 'Coupon code must be alphanumeric'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    type: {
      type: String,
      enum: ['percent', 'flat'],
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    minOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUses: {
      type: Number,
      default: 1000,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    oncePerUser: {
      type: Boolean,
      default: true,
    },
    startsAt: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

couponSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });

couponSchema.pre('validate', function (next) {
  if (this.type === 'percent' && this.value > 100) {
    this.invalidate('value', 'Percent coupon value cannot exceed 100');
  }
  if (this.expiresAt && this.startsAt && this.expiresAt <= this.startsAt) {
    this.invalidate('expiresAt', 'Expiry must be after start date');
  }
  if (!this.title && this.code) {
    this.title = this.code;
  }
  next();
});

/** Live availability (not persisted) */
couponSchema.virtual('isValid').get(function (this: ICoupon) {
  const now = new Date();
  return (
    this.isActive &&
    this.startsAt <= now &&
    this.expiresAt > now &&
    this.usedCount < this.maxUses
  );
});

couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);

/** Shared discount math for validate + order create */
export function calculateCouponDiscount(
  coupon: Pick<ICoupon, 'type' | 'value' | 'maxDiscount'>,
  cartAmount: number,
): number {
  let discount =
    coupon.type === 'percent'
      ? Math.floor((cartAmount * coupon.value) / 100)
      : coupon.value;

  if (coupon.maxDiscount != null && coupon.maxDiscount > 0) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  return Math.min(Math.max(0, discount), cartAmount);
}

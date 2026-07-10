import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  usedBy: mongoose.Types.ObjectId[];
  expiresAt: Date;
  isActive: boolean;
  description?: string;
  createdAt: Date;
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
    },
    type: { type: String, enum: ['percent', 'flat'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0, min: 0 },
    maxUses: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0, min: 0 },
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    description: String,
  },
  { timestamps: true },
);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ expiresAt: 1 });

// Virtual: is coupon currently valid?
couponSchema.virtual('isValid').get(function () {
  return (
    this.isActive &&
    this.expiresAt > new Date() &&
    this.usedCount < this.maxUses
  );
});

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);

import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface INewsletter extends Document {
  email: string;
  unsubToken: string;
  isActive: boolean;
  subscribedAt: Date;
}

const newsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    unsubToken: {
      type: String,
      default: () => crypto.randomBytes(32).toString('hex'),
      unique: true,
    },
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

newsletterSchema.index({ email: 1 }, { unique: true });
newsletterSchema.index({ unsubToken: 1 }, { unique: true });

export const Newsletter = mongoose.model<INewsletter>('Newsletter', newsletterSchema);

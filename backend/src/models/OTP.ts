import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type OTPType = 'login' | 'register' | 'reset-password' | 'phone-verify';

export interface IOTP extends Document {
  identifier: string;  // email or phone
  hashedCode: string;
  type: OTPType;
  attempts: number;
  expiresAt: Date;
  compare(code: string): Promise<boolean>;
}

const otpSchema = new Schema<IOTP>({
  identifier: { type: String, required: true, lowercase: true, trim: true },
  hashedCode: { type: String, required: true, select: false },
  type: {
    type: String,
    enum: ['login', 'register', 'reset-password', 'phone-verify'],
    required: true,
  },
  attempts: { type: Number, default: 0, max: 5 },
  expiresAt: { type: Date, required: true },
});

// TTL index — auto-delete after expiry
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ identifier: 1, type: 1 });

// Static: create and save an OTP (raw code → hashed)
otpSchema.statics.createOTP = async function (
  identifier: string,
  type: OTPType,
  rawCode: string,
  ttlMinutes = 5,
): Promise<void> {
  const hashedCode = await bcrypt.hash(rawCode, 10);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  // Upsert (overwrite any existing OTP for same identifier+type)
  await this.findOneAndUpdate(
    { identifier: identifier.toLowerCase(), type },
    { $set: { hashedCode, expiresAt, attempts: 0 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

// Instance method: compare
otpSchema.methods.compare = async function (code: string): Promise<boolean> {
  return bcrypt.compare(code, this.hashedCode);
};

export const OTP = mongoose.model<IOTP>('OTP', otpSchema);

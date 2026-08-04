import mongoose, { Document, Schema } from 'mongoose';

export type FeeType = 'percent' | 'flat';

export interface IStoreSettings extends Document {
  key: 'store';
  /** Commission applied on (subtotal - discount) */
  commissionType: FeeType;
  commissionValue: number;
  /** Platform fee applied on (subtotal - discount) or flat */
  platformFeeType: FeeType;
  platformFeeValue: number;
  /** Flat delivery charge when order is below freeDeliveryMin */
  deliveryCharge: number;
  /** Merchandise amount (subtotal − discount) at/above which delivery is free */
  freeDeliveryMin: number;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const storeSettingsSchema = new Schema<IStoreSettings>(
  {
    key: { type: String, enum: ['store'], default: 'store', unique: true },
    commissionType: { type: String, enum: ['percent', 'flat'], default: 'percent' },
    commissionValue: { type: Number, default: 5, min: 0 },
    platformFeeType: { type: String, enum: ['percent', 'flat'], default: 'flat' },
    platformFeeValue: { type: Number, default: 10, min: 0 },
    deliveryCharge: { type: Number, default: 40, min: 0 },
    freeDeliveryMin: { type: Number, default: 499, min: 0 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const StoreSettings = mongoose.model<IStoreSettings>('StoreSettings', storeSettingsSchema);

export async function getOrCreateStoreSettings(): Promise<IStoreSettings> {
  let settings = await StoreSettings.findOne({ key: 'store' });
  if (!settings) {
    settings = await StoreSettings.create({
      key: 'store',
      commissionType: 'percent',
      commissionValue: 5,
      platformFeeType: 'flat',
      platformFeeValue: 10,
      deliveryCharge: 40,
      freeDeliveryMin: 499,
    });
  } else {
    // Backfill new fields for docs created before delivery settings existed
    let dirty = false;
    if (settings.deliveryCharge == null) {
      settings.deliveryCharge = 40;
      dirty = true;
    }
    if (settings.freeDeliveryMin == null) {
      settings.freeDeliveryMin = 499;
      dirty = true;
    }
    if (dirty) await settings.save();
  }
  return settings;
}

export function calculateFeeAmount(
  type: FeeType,
  value: number,
  baseAmount: number,
): number {
  if (!value || value <= 0 || baseAmount < 0) return 0;
  if (type === 'percent') {
    if (baseAmount <= 0) return 0;
    return Math.floor((baseAmount * value) / 100);
  }
  return Math.max(0, value);
}

/** Delivery based on admin-configured charge + free-shipping threshold */
export function calculateDeliveryCharge(
  settings: Pick<IStoreSettings, 'deliveryCharge' | 'freeDeliveryMin'>,
  merchandiseAmount: number,
): number {
  const threshold = settings.freeDeliveryMin ?? 0;
  const charge = settings.deliveryCharge ?? 0;
  if (threshold > 0 && merchandiseAmount >= threshold) return 0;
  return Math.max(0, charge);
}

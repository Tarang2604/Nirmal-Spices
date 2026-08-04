import { Request, Response } from 'express';
import { z } from 'zod';
import { getOrCreateStoreSettings } from '../models/StoreSettings';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { writeAuditLog } from '../middleware/audit';
import { ApiError } from '../utils/apiError';

export const getStoreSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getOrCreateStoreSettings();
  return sendSuccess(res, settings, 'Store settings fetched');
});

const updateSettingsSchema = z.object({
  commissionType: z.enum(['percent', 'flat']),
  commissionValue: z.coerce.number().min(0).max(10000),
  platformFeeType: z.enum(['percent', 'flat']),
  platformFeeValue: z.coerce.number().min(0).max(10000),
  deliveryCharge: z.coerce.number().min(0).max(10000),
  freeDeliveryMin: z.coerce.number().min(0).max(100000),
});

export const updateStoreSettings = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest('Invalid settings payload', parsed.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    })));
  }

  const settings = await getOrCreateStoreSettings();
  const before = {
    commissionType: settings.commissionType,
    commissionValue: settings.commissionValue,
    platformFeeType: settings.platformFeeType,
    platformFeeValue: settings.platformFeeValue,
    deliveryCharge: settings.deliveryCharge,
    freeDeliveryMin: settings.freeDeliveryMin,
  };

  settings.commissionType = parsed.data.commissionType;
  settings.commissionValue = parsed.data.commissionValue;
  settings.platformFeeType = parsed.data.platformFeeType;
  settings.platformFeeValue = parsed.data.platformFeeValue;
  settings.deliveryCharge = parsed.data.deliveryCharge;
  settings.freeDeliveryMin = parsed.data.freeDeliveryMin;
  if (req.user?._id) {
    settings.updatedBy = req.user._id as any;
  }
  await settings.save();

  void writeAuditLog({
    req,
    action: 'SETTINGS_UPDATE',
    entity: 'system',
    entityId: settings._id.toString(),
    before,
    after: parsed.data,
    meta: { kind: 'store_settings' },
  });

  return sendSuccess(res, settings, 'Store settings updated');
});

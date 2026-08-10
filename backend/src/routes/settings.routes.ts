import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import {
  calculateDeliveryCharge,
  calculateFeeAmount,
  getOrCreateStoreSettings,
} from '../models/StoreSettings';

const router = Router();

/** Public, safe-to-expose site settings (e.g. Google review link) for storefront pages */
router.get(
  '/public',
  asyncHandler(async (_req, res) => {
    const settings = await getOrCreateStoreSettings();
    return sendSuccess(res, {
      googleReviewUrl: settings.googleReviewUrl || null,
    });
  }),
);

/** Public fee preview for checkout / cart UI */
router.get(
  '/fees',
  asyncHandler(async (req, res) => {
    const amount = Math.max(0, Number(req.query.amount) || 0);
    const settings = await getOrCreateStoreSettings();
    const commission = calculateFeeAmount(
      settings.commissionType,
      settings.commissionValue,
      amount,
    );
    const platformFee = calculateFeeAmount(
      settings.platformFeeType,
      settings.platformFeeValue,
      amount,
    );
    const shipping = calculateDeliveryCharge(settings, amount);

    return sendSuccess(res, {
      commissionType: settings.commissionType,
      commissionValue: settings.commissionValue,
      platformFeeType: settings.platformFeeType,
      platformFeeValue: settings.platformFeeValue,
      deliveryCharge: settings.deliveryCharge,
      freeDeliveryMin: settings.freeDeliveryMin,
      commission,
      platformFee,
      shipping,
      amount,
    });
  }),
);

export default router;

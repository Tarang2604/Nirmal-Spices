import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import {
  calculateDeliveryCharge,
  calculateFeeAmount,
  getOrCreateStoreSettings,
} from '../models/StoreSettings';

const router = Router();

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

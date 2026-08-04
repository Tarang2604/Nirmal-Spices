import { Router } from 'express';
import * as couponController from '../controllers/coupon.controller';
import { verifyAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  validateCouponSchema,
  createCouponSchema,
  updateCouponSchema,
} from '../validators/coupon.validator';

const router = Router();

// Public — active coupons for checkout / storefront
router.get('/available', couponController.getAvailableCoupons);

// Validate during checkout (authenticated users)
router.post(
  '/validate',
  verifyAuth,
  validate(validateCouponSchema),
  couponController.validateCoupon,
);

// Admin coupon management
router.use(verifyAuth, requireAdmin);

router.get('/', couponController.getCoupons);
router.post('/', validate(createCouponSchema), couponController.createCoupon);
router.put('/:id', validate(updateCouponSchema), couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

export default router;

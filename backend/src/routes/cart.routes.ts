import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemParamsSchema,
} from '../validators/cart.validator';

const router = Router();

// Guest-friendly cart routes (uses JWT if present, falls back to x-guest-session-id header)
router.use(optionalAuth);

router.get('/', cartController.getCart);
router.post('/add', validate(addToCartSchema), cartController.addToCart);
router.put('/update', validate(updateCartItemSchema), cartController.updateCartItem);
router.delete(
  '/remove/:productId/:weight',
  validate(removeCartItemParamsSchema, 'params'),
  cartController.removeFromCart,
);
router.delete('/clear', cartController.clearCart);

export default router;

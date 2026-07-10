import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Guest-friendly cart routes (uses JWT if present, falls back to x-guest-session-id header)
router.use(optionalAuth);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove/:productId/:weight', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

export default router;

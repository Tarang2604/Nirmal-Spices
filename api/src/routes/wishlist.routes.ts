import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller';
import { verifyAuth } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();

// All wishlist routes require authentication
router.use(verifyAuth);

router.get('/', wishlistController.getWishlist);
router.post('/toggle', apiLimiter, wishlistController.toggleWishlist);
router.delete('/clear', wishlistController.clearWishlist);

export default router;

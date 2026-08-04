import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller';
import { verifyAuth } from '../middleware/auth';

const router = Router();

router.use(verifyAuth);

router.get('/', wishlistController.getWishlist);
router.post('/:productId/toggle', wishlistController.toggleWishlist);
router.post('/:productId', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

export default router;

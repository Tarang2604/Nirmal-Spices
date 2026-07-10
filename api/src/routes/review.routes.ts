import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { verifyAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '../validators/review.validator';

const router = Router();

// Public: Get reviews for a product
router.get('/:productId', reviewController.getReviews);

// Authenticated users: Submit review
router.post('/:productId', verifyAuth, validate(createReviewSchema), reviewController.createReview);

// Admin-only review approval trigger
router.put('/:id/approve', verifyAuth, requireAdmin, reviewController.approveReview);

// Delete review (owner or admin check handled in controller)
router.delete('/:id', verifyAuth, reviewController.deleteReview);

export default router;

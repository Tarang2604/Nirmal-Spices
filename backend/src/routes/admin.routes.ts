import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import * as settingsController from '../controllers/settings.controller';
import { verifyAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

// Strict security: require valid JWT access token + role='admin'
router.use(verifyAuth, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/orders', adminController.getAdminOrders);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/block', adminController.toggleUserBlock);
router.put('/orders/:id/status', validate(updateOrderStatusSchema), adminController.updateOrderStatus);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/reviews/pending', adminController.getPendingReviews);
router.get('/settings', settingsController.getStoreSettings);
router.put('/settings', settingsController.updateStoreSettings);

export default router;

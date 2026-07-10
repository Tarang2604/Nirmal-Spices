import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { verifyAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

// Strict security: require valid JWT access token + role='admin'
router.use(verifyAuth, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/block', adminController.toggleUserBlock);
router.put('/orders/:id/status', validate(updateOrderStatusSchema), adminController.updateOrderStatus);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;

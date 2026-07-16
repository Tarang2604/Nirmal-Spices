import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { verifyAuth, optionalAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idempotency } from '../middleware/idempotency';
import { createOrderSchema, verifyPaymentSchema } from '../validators/order.validator';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();

// Webhook is public (Razorpay calls it directly, verified with HMAC signature inside controller)
// Must skip JSON parsing middleware in server.ts for raw body access
router.post('/webhook', orderController.handleRazorpayWebhook);

// Guest checkout support means create and verify can be optional auth
router.post(
  '/create',
  optionalAuth,
  apiLimiter,
  idempotency,
  validate(createOrderSchema),
  orderController.createOrder
);

router.post(
  '/verify',
  optionalAuth,
  validate(verifyPaymentSchema),
  orderController.verifyPayment
);

// Guest order lookup (public — verified by email/phone inside controller)
router.get('/guest/:id', orderController.getGuestOrder);

// Strictly protected user routes
router.use(verifyAuth);

router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/cancel', orderController.cancelOrder);

// Admin-only: list all orders with filters
router.get('/admin/all', requireAdmin, orderController.getAllOrders);

export default router;

import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { verifyAuth, optionalAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idempotency } from '../middleware/idempotency';
import { createOrderSchema, verifyPaymentSchema } from '../validators/order.validator';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();

// Webhook is public (Razorpay HMAC verified in controller)
router.post('/webhook', orderController.handleRazorpayWebhook);

router.post(
  '/create',
  optionalAuth,
  apiLimiter,
  idempotency,
  validate(createOrderSchema),
  orderController.createOrder,
);

router.post(
  '/verify',
  optionalAuth,
  validate(verifyPaymentSchema),
  orderController.verifyPayment,
);

// Guest can view order with ?email= matching guestEmail
router.get('/:id', optionalAuth, orderController.getOrderById);

// Strictly protected user routes
router.use(verifyAuth);

router.get('/', orderController.getMyOrders);
router.put('/:id/cancel', orderController.cancelOrder);

// Admin-only: list all orders with filters
router.get('/admin/all', requireAdmin, orderController.getAllOrders);

export default router;

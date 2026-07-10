import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { validate } from '../middleware/validate';
import { contactLimiter, apiLimiter } from '../middleware/rateLimit';
import { z } from 'zod';

const router = Router();

const contactSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(2, 'Subject is required'),
  orderId: z.string().optional(),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Contact Form submission (rate-limited)
router.post('/', contactLimiter, validate(contactSchema), contactController.submitContact);

// Newsletter Subscription
router.post('/newsletter/subscribe', apiLimiter, validate(newsletterSchema), contactController.subscribeNewsletter);
router.get('/newsletter/unsubscribe', apiLimiter, contactController.unsubscribeNewsletter);

export default router;

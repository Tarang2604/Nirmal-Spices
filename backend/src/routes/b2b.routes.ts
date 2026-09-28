import { Router } from 'express';
import * as b2bController from '../controllers/b2b.controller';
import { validate } from '../middleware/validate';
import { contactLimiter } from '../middleware/rateLimit';
import { z } from 'zod';

const router = Router();

const b2bEnquirySchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(100),
  lastName: z.string().trim().max(100).optional(),
  companyName: z.string().trim().min(2, 'Company or business name is required').max(150),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(8, 'Phone number must be at least 8 digits').max(25),
  businessType: z.string().trim().min(2, 'Please select your business type').max(100),
  products: z.string().trim().min(2, 'Please specify the required products').max(2000),
  quantity: z.string().trim().min(1, 'Please specify the estimated quantity').max(200),
  packaging: z.string().trim().max(200).optional(),
  location: z.string().trim().min(2, 'Delivery location is required').max(300),
  message: z.string().trim().max(2000).optional(),
});

// Submit B2B Bulk Order Enquiry (Rate limited: 5 per hour per IP)
router.post('/', contactLimiter, validate(b2bEnquirySchema), b2bController.submitB2BEnquiry);

export default router;

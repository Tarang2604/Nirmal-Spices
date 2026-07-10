import { z } from 'zod';
import { addressSchema } from './auth.validator';

const orderItemInputSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  weight: z.string().min(1, 'Weight variant is required'),
  qty: z.number().int().min(1, 'Quantity must be at least 1').max(50, 'Max 50 per item'),
});

export const createOrderSchema = z.object({
  guestEmail: z.string().email('Invalid email').optional(),
  guestPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number').optional(),
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item'),
  address: addressSchema,
  paymentMethod: z.enum(['razorpay', 'cod']),
  couponCode: z.string().toUpperCase().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay Signature is required'),
  orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Order ID'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending', 'confirmed', 'processing', 'dispatched',
    'out-for-delivery', 'delivered', 'cancelled', 'refunded', 'payment-failed',
  ]),
  trackingNumber: z.string().optional(),
  note: z.string().optional(),
});

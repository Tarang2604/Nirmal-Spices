import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(['percent', 'flat']),
  value: z.number().min(0),
  minOrder: z.number().min(0).default(0),
  maxUses: z.number().int().min(1).default(1000),
  expiresAt: z.string().datetime('Must be a valid ISO datetime string'),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  cartAmount: z.number().min(0),
});

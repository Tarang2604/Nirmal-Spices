import { z } from 'zod';

/** Accept ISO datetime or date-only (YYYY-MM-DD) from admin date inputs */
const expiresAtSchema = z
  .string()
  .min(1, 'Expiry date is required')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Must be a valid date');

export const createCouponSchema = z
  .object({
    code: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[A-Za-z0-9_-]+$/, 'Code must be alphanumeric')
      .transform((v) => v.toUpperCase()),
    title: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(500).optional().default(''),
    type: z.enum(['percent', 'flat']),
    value: z.coerce.number().min(0),
    maxDiscount: z.coerce.number().min(0).optional(),
    minOrder: z.coerce.number().min(0).default(0),
    maxUses: z.coerce.number().int().min(1).default(1000),
    oncePerUser: z.boolean().default(true),
    startsAt: expiresAtSchema.optional(),
    expiresAt: expiresAtSchema,
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'percent' && data.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'Percent value cannot exceed 100',
      });
    }
  });

const couponFieldsSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Za-z0-9_-]+$/, 'Code must be alphanumeric')
    .transform((v) => v.toUpperCase())
    .optional(),
  title: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  type: z.enum(['percent', 'flat']).optional(),
  value: z.coerce.number().min(0).optional(),
  maxDiscount: z.coerce.number().min(0).optional().nullable(),
  minOrder: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().int().min(1).optional(),
  oncePerUser: z.boolean().optional(),
  startsAt: expiresAtSchema.optional(),
  expiresAt: expiresAtSchema.optional(),
  isActive: z.boolean().optional(),
});

export const updateCouponSchema = couponFieldsSchema.superRefine((data, ctx) => {
  if (data.type === 'percent' && data.value != null && data.value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['value'],
      message: 'Percent value cannot exceed 100',
    });
  }
});

export const validateCouponSchema = z.object({
  code: z
    .string()
    .min(1)
    .transform((v) => v.toUpperCase().trim()),
  cartAmount: z.coerce.number().min(0),
});

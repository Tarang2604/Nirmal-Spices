import { z } from 'zod';

export const addToCartSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  weight: z.string().min(1, 'Weight variant is required'),
  qty: z.number().int().min(1, 'Quantity must be at least 1').max(50, 'Max 50 per item'),
});

export const updateCartItemSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  weight: z.string().min(1, 'Weight variant is required'),
  qty: z.number().int().min(1, 'Quantity must be at least 1').max(50, 'Max 50 per item'),
});

export const removeCartItemParamsSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  weight: z.string().min(1, 'Weight variant is required'),
});

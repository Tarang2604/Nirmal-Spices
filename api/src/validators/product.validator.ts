import { z } from 'zod';

const weightVariantSchema = z.object({
  weight: z.string().min(1, 'Weight designation is required (e.g. 100g)'),
  price: z.number().min(0, 'Price must be non-negative'),
  mrp: z.number().min(0, 'MRP must be non-negative'),
  stock: z.number().int().min(0, 'Stock must be a non-negative integer'),
  sku: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name is required').max(200),
  category: z.enum(['blend-spices', 'ground-spices', 'whole-spices', 'salts-sugars', 'flour', 'instant-mix']),
  subCategory: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  ingredients: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  usageTips: z.array(z.string()).default([]),
  weights: z.array(weightVariantSchema).min(1, 'At least one weight variant is required'),
  tags: z.array(z.string()).default([]),
  badge: z.enum(['bestseller', 'new', 'sale', 'organic', 'premium']).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).default({}),
});

export const updateProductSchema = createProductSchema.partial();

export const queryProductSchema = z.object({
  category: z.string().optional(),
  badge: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

import { z } from 'zod';

const weightVariantSchema = z.object({
  weight: z.string().min(1, 'Weight designation is required (e.g. 100g)'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  mrp: z.coerce.number().min(0, 'MRP must be non-negative'),
  stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer'),
  sku: z.string().optional(),
});

/** Multipart forms: JSON arrays, or comma / semicolon / newline separated text */
const jsonArray = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fall through to split
      }
      return trimmed
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return val;
  }, z.array(itemSchema));

const jsonObject = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  }, schema);

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name is required').max(200),
  category: z.string().min(2, 'Category is required').max(100),
  subCategory: z.string().optional(),
  brand: z.string().max(100).optional(),
  shortDescription: z.string().max(300).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  ingredients: jsonArray(z.string()).default([]),
  benefits: jsonArray(z.string()).default([]),
  usageTips: jsonArray(z.string()).default([]),
  shelfLife: z.string().max(200).optional(),
  storageInstructions: z.string().max(500).optional(),
  weights: jsonArray(weightVariantSchema).refine((arr) => arr.length >= 1, {
    message: 'At least one weight variant is required',
  }),
  tags: jsonArray(z.string()).default([]),
  badge: z.enum(['bestseller', 'new', 'sale', 'organic', 'premium']).optional().or(z.literal('')),
  isActive: z.preprocess((v) => {
    if (v === 'true') return true;
    if (v === 'false') return false;
    return v;
  }, z.boolean().default(true)),
  isFeatured: z.preprocess((v) => {
    if (v === 'true') return true;
    if (v === 'false') return false;
    return v;
  }, z.boolean().default(false)),
  seo: jsonObject(
    z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      })
      .default({}),
  ).default({}),
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

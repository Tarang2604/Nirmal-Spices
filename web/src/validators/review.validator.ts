import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1, 'Review title is required').max(100),
  body: z.string().min(10, 'Review content must be at least 10 characters').max(2000),
});

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return value;
}, z.boolean());

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),
    CLIENT_URL: z.string().url(),

    MONGODB_URI: z.string().min(1),
    REDIS_ENABLED: booleanFromEnv.default(false),
    REDIS_URL: z.string().min(1).optional(),

    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),

    RAZORPAY_KEY_ID: z.string().min(1),
    RAZORPAY_KEY_SECRET: z.string().min(1),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

    // TEST/STAGING ONLY — when true, order creation skips the live Razorpay
    // API call and admins can manually mark an order as paid via
    // PUT /api/orders/:id/mark-paid-test. Must be false (default) wherever
    // real customer payments are collected.
    PAYMENT_TEST_MODE: booleanFromEnv.default(false),

    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    CLOUDINARY_FOLDER: z.string().default('nirmal-spices'),

    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().default(587),
    // true for port 465 (implicit TLS), false for 587/25 (STARTTLS)
    SMTP_SECURE: booleanFromEnv.default(false),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),
    EMAIL_FROM: z.string().min(1),
    EMAIL_REPLY_TO: z.string().optional(),

    MSG91_AUTH_KEY: z.string().optional(),
    MSG91_TEMPLATE_ID: z.string().optional(),
    MSG91_SENDER_ID: z.string().optional(),

    SENTRY_DSN: z.preprocess(
      (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
      z.string().url().optional(),
    ),
    ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_PASSWORD: z.string().min(8).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.REDIS_ENABLED && !data.REDIS_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['REDIS_URL'],
        message: 'REDIS_URL is required when REDIS_ENABLED=true',
      });
    }
    if (data.PAYMENT_TEST_MODE && data.NODE_ENV === 'production') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['PAYMENT_TEST_MODE'],
        message: 'PAYMENT_TEST_MODE must not be true when NODE_ENV=production — it bypasses real payment collection',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

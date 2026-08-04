import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/apiError';
import { env } from '../config/env';

const isDev = env.NODE_ENV === 'development';

const handler = (_req: unknown, _res: unknown, next: (err: unknown) => void, _opts: unknown) => {
  next(ApiError.tooMany('Too many requests — please slow down'));
};

/** Auth endpoints: 5 attempts per 15 minutes per IP */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 50 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
  skipSuccessfulRequests: true, // only count failed attempts
});

/** OTP send/verify — generous in development so local testing isn't blocked */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isDev ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/** General API: 100 requests per minute per IP */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/** Upload endpoints: 10 per minute per IP */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

/** Contact form: 5 per hour per IP */
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

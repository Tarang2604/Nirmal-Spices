import { Request, Response, NextFunction } from 'express';
import { redisGet, redisSet, RedisKeys } from '../config/redis';
import { logger } from '../utils/logger';

const TTL = 15 * 60; // 15 minutes

/**
 * Idempotency middleware for order creation.
 * Reads `X-Idempotency-Key` header.
 * If the key was seen before, returns the cached response immediately.
 * Otherwise processes the request and caches the result.
 */
export function idempotency(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const key = req.headers['x-idempotency-key'] as string | undefined;

  if (!key) {
    // No key provided — proceed without idempotency
    return next();
  }

  const redisKey = RedisKeys.idempotency(key);

  // Check if we've seen this key before (async IIFE)
  void (async () => {
    try {
      const cached = await redisGet(redisKey);

      if (cached) {
        const parsed = JSON.parse(cached) as { status: number; body: unknown };
        logger.debug({ key }, 'Idempotency cache hit — returning cached response');
        res.status(parsed.status).json(parsed.body);
        return;
      }

      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        if (res.statusCode < 500) {
          // Cache successful responses only
          void redisSet(
            redisKey,
            JSON.stringify({ status: res.statusCode, body }),
            TTL,
          );
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      logger.warn({ err, key }, 'Idempotency Redis error — proceeding without cache');
      next();
    }
  })();
}

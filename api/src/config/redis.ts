import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redis: Redis;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 5) return null; // stop retrying
        return Math.min(times * 200, 2000);
      },
    });

    redis.on('connect', () => logger.info('✅ Redis connected'));
    redis.on('error', (err) => logger.error({ err }, 'Redis error'));
    redis.on('close', () => logger.warn('Redis connection closed'));
  }
  return redis;
}

// Convenience helpers ------------------------------------------------

/** Store a key-value pair with optional TTL (seconds) */
export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> {
  const r = getRedis();
  if (ttlSeconds) {
    await r.set(key, value, 'EX', ttlSeconds);
  } else {
    await r.set(key, value);
  }
}

/** Retrieve a value; returns null if missing */
export async function redisGet(key: string): Promise<string | null> {
  return getRedis().get(key);
}

/** Delete one or more keys */
export async function redisDel(...keys: string[]): Promise<void> {
  await getRedis().del(...keys);
}

/** Check if a key exists */
export async function redisExists(key: string): Promise<boolean> {
  const count = await getRedis().exists(key);
  return count > 0;
}

/** Delete all keys matching a pattern (use carefully) */
export async function redisDelPattern(pattern: string): Promise<void> {
  const r = getRedis();
  const keys = await r.keys(pattern);
  if (keys.length > 0) {
    await r.del(...keys);
  }
}

// Key factories (centralised namespace) ----------------------------
export const RedisKeys = {
  refreshToken: (userId: string, tokenId: string) =>
    `rt:${userId}:${tokenId}`,
  allRefreshTokens: (userId: string) => `rt:${userId}:*`,
  otp: (identifier: string, type: string) => `otp:${type}:${identifier}`,
  idempotency: (key: string) => `idem:${key}`,
  guestCart: (sessionId: string) => `gcart:${sessionId}`,
  productCache: (slug: string) => `product:${slug}`,
  productsCache: (hash: string) => `products:${hash}`,
  rateLimit: (type: string, ip: string) => `rl:${type}:${ip}`,
};

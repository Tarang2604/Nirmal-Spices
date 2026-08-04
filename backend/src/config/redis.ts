import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redis: Redis | null = null;

export function isRedisEnabled(): boolean {
  return env.REDIS_ENABLED && !!env.REDIS_URL;
}

export function getRedis(): Redis | null {
  if (!isRedisEnabled()) {
    return null;
  }

  if (!redis) {
    redis = new Redis(env.REDIS_URL as string, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
      },
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (err) => logger.error({ err }, 'Redis error'));
    redis.on('close', () => logger.warn('Redis connection closed'));
  }

  return redis;
}

export async function connectRedis(): Promise<Redis | null> {
  if (!isRedisEnabled()) {
    logger.info('Redis is disabled via REDIS_ENABLED flag.');
    return null;
  }

  try {
    const client = getRedis();
    if (client && client.status !== 'ready' && client.status !== 'connect') {
      await client.connect();
    }
    return client;
  } catch (err) {
    logger.error({ err }, 'Failed to connect to Redis');
    return null;
  }
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    try {
      await redis.quit();
    } catch {
      // Ignore shutdown errors
    } finally {
      redis = null;
    }
  }
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> {
  const client = getRedis();
  if (!client) return;

  if (ttlSeconds) {
    await client.set(key, value, 'EX', ttlSeconds);
  } else {
    await client.set(key, value);
  }
}

export async function redisGet(key: string): Promise<string | null> {
  const client = getRedis();
  if (!client) return null;
  return client.get(key);
}

export async function redisDel(...keys: string[]): Promise<void> {
  const client = getRedis();
  if (!client || keys.length === 0) return;
  await client.del(...keys);
}

export async function redisExists(key: string): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  const count = await client.exists(key);
  return count > 0;
}

export async function redisDelPattern(pattern: string): Promise<void> {
  const client = getRedis();
  if (!client) return;

  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(...keys);
  }
}

export const RedisKeys = {
  refreshToken: (userId: string, tokenId: string) => `rt:${userId}:${tokenId}`,
  allRefreshTokens: (userId: string) => `rt:${userId}:*`,
  otp: (identifier: string, type: string) => `otp:${type}:${identifier}`,
  idempotency: (key: string) => `idem:${key}`,
  guestCart: (sessionId: string) => `gcart:${sessionId}`,
  productCache: (slug: string) => `product:${slug}`,
  productsCache: (hash: string) => `products:${hash}`,
  rateLimit: (type: string, ip: string) => `rl:${type}:${ip}`,
};

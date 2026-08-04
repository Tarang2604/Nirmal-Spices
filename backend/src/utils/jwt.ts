import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { env } from '../config/env';
import { redisSet, redisDel, redisDelPattern, RedisKeys, isRedisEnabled } from '../config/redis';
import { logger } from './logger';

export interface AccessTokenPayload {
  sub: string;
  role: 'user' | 'admin';
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
}

export function signAccessToken(userId: string, role: 'user' | 'admin'): string {
  return jwt.sign(
    { sub: userId, role } satisfies AccessTokenPayload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'] },
  );
}

export function signRefreshToken(userId: string, tokenId: string): string {
  return jwt.sign(
    { sub: userId, tokenId } satisfies RefreshTokenPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'] },
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

const IS_PROD = env.NODE_ENV === 'production';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

// Path `/` for both so cookies work via the Next.js `/backend-api` proxy and on direct API calls.
// In production (cross-site frontend/API), SameSite=None + Secure is required for credentialed fetches.
const COOKIE_OPTS_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: (IS_PROD ? 'none' : 'lax') as 'strict' | 'lax' | 'none',
  path: '/',
};

export async function issueTokenPair(
  res: Response,
  userId: string,
  role: 'user' | 'admin',
): Promise<void> {
  const tokenId = uuidv4();

  const accessToken = signAccessToken(userId, role);
  const refreshToken = signRefreshToken(userId, tokenId);

  const SEVEN_DAYS = 7 * 24 * 60 * 60;
  if (isRedisEnabled()) {
    await redisSet(RedisKeys.refreshToken(userId, tokenId), '1', SEVEN_DAYS);
  }

  res.cookie(ACCESS_COOKIE, accessToken, {
    ...COOKIE_OPTS_BASE,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...COOKIE_OPTS_BASE,
    maxAge: SEVEN_DAYS * 1000,
  });

  logger.debug({ userId, tokenId }, 'Token pair issued');
}

export async function revokeRefreshToken(
  userId: string,
  tokenId: string,
): Promise<void> {
  if (!isRedisEnabled()) return;
  await redisDel(RedisKeys.refreshToken(userId, tokenId));
}

export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  if (!isRedisEnabled()) return;
  await redisDelPattern(RedisKeys.allRefreshTokens(userId));
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { ...COOKIE_OPTS_BASE });
  res.clearCookie(REFRESH_COOKIE, { ...COOKIE_OPTS_BASE });
}

export { ACCESS_COOKIE, REFRESH_COOKIE };

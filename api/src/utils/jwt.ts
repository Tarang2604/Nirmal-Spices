import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { env } from '../config/env';
import { redisSet, redisDel, redisDelPattern, RedisKeys } from '../config/redis';
import { logger } from './logger';

export interface AccessTokenPayload {
  sub: string;      // userId
  role: 'user' | 'admin';
}

export interface RefreshTokenPayload {
  sub: string;      // userId
  tokenId: string;  // UUID for Redis key
}

// ── Sign tokens ─────────────────────────────────────────────────────

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

// ── Verify tokens ────────────────────────────────────────────────────

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

// ── Cookie constants ─────────────────────────────────────────────────

const IS_PROD = env.NODE_ENV === 'production';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

const COOKIE_OPTS_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: (IS_PROD ? 'strict' : 'lax') as 'strict' | 'lax',
  path: '/',
};

// ── Issue a token pair → set cookies + store refresh in Redis ────────

export async function issueTokenPair(
  res: Response,
  userId: string,
  role: 'user' | 'admin',
): Promise<void> {
  const tokenId = uuidv4();

  const accessToken = signAccessToken(userId, role);
  const refreshToken = signRefreshToken(userId, tokenId);

  // Store refresh token hash in Redis (7 days)
  const SEVEN_DAYS = 7 * 24 * 60 * 60;
  await redisSet(RedisKeys.refreshToken(userId, tokenId), '1', SEVEN_DAYS);

  // Access token cookie (15 min)
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...COOKIE_OPTS_BASE,
    maxAge: 15 * 60 * 1000,
  });

  // Refresh token cookie (7 days)
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...COOKIE_OPTS_BASE,
    maxAge: SEVEN_DAYS * 1000,
    path: '/api/auth/refresh',
  });

  logger.debug({ userId, tokenId }, 'Token pair issued');
}

// ── Revoke a specific refresh token ─────────────────────────────────

export async function revokeRefreshToken(
  userId: string,
  tokenId: string,
): Promise<void> {
  await redisDel(RedisKeys.refreshToken(userId, tokenId));
}

// ── Revoke ALL refresh tokens for a user (e.g. password reset) ──────

export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await redisDelPattern(RedisKeys.allRefreshTokens(userId));
}

// ── Clear auth cookies ───────────────────────────────────────────────

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { ...COOKIE_OPTS_BASE });
  res.clearCookie(REFRESH_COOKIE, { ...COOKIE_OPTS_BASE, path: '/api/auth/refresh' });
}

export { ACCESS_COOKIE, REFRESH_COOKIE };

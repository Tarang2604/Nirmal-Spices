import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, ACCESS_COOKIE, AccessTokenPayload } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        role: 'user' | 'admin';
        email: string;
        name: string;
        isBlocked: boolean;
      };
    }
  }
}

/**
 * Verifies the access_token httpOnly cookie.
 * Attaches req.user if valid.
 */
export const verifyAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[ACCESS_COOKIE] as string | undefined;

    if (!token) {
      throw ApiError.unauthorized('Authentication required');
    }

    let payload: AccessTokenPayload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    // Lightweight DB lookup — only fetch fields we need
    const user = await User.findById(payload.sub)
      .select('_id name email role isBlocked')
      .lean();

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (user.isBlocked) {
      throw ApiError.forbidden('Your account has been suspended');
    }

    req.user = {
      _id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      isBlocked: user.isBlocked,
    };

    next();
  },
);

/**
 * Optional auth — attaches req.user if a valid token is present,
 * but does NOT throw if the cookie is missing (for guest-friendly routes).
 */
export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[ACCESS_COOKIE] as string | undefined;

    if (!token) return next();

    try {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub)
        .select('_id name email role isBlocked')
        .lean();

      if (user && !user.isBlocked) {
        req.user = {
          _id: user._id.toString(),
          role: user.role,
          email: user.email,
          name: user.name,
          isBlocked: user.isBlocked,
        };
      }
    } catch {
      // Invalid token — treat as guest
    }

    next();
  },
);

/**
 * Requires the authenticated user to have the 'admin' role.
 * Must be used AFTER verifyAuth.
 */
export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    next(ApiError.unauthorized('Authentication required'));
    return;
  }
  if (req.user.role !== 'admin') {
    next(ApiError.forbidden('Admin access required'));
    return;
  }
  next();
};

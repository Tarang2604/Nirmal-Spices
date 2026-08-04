import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler and forwards any thrown error to Express's
 * next() error handler — eliminates try/catch boilerplate in every controller.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

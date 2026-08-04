import { Response } from 'express';

interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  counts?: Record<string, number>;
  [key: string]: unknown;
}

/**
 * Sends a standardised JSON success response.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: ApiResponseMeta,
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  });
}

/**
 * Sends a standardised JSON error response.
 * Prefer throwing ApiError and letting the error handler call this.
 */
export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown[],
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
}

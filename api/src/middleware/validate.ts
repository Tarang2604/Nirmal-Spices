import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/apiError';

type ValidateTarget = 'body' | 'query' | 'params';

/**
 * Returns an Express middleware that validates req[target] against a Zod schema.
 * On success, replaces req[target] with the parsed (coerced/stripped) value.
 * On failure, throws a 400 ApiError with field-level error details.
 */
export function validate<T>(schema: ZodSchema<T>, target: ValidateTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      throw ApiError.badRequest('Validation failed', errors);
    }

    // Replace with parsed/coerced value (e.g. trimmed strings, converted numbers)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any)[target] = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError): { field: string; message: string }[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

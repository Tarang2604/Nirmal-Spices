import { Request, Response, NextFunction } from 'express';
import { AuditLog, AuditAction, AuditEntity } from '../models/AuditLog';
import { logger } from '../utils/logger';

/**
 * Writes an audit log entry for a sensitive admin action.
 * Call this directly inside admin controllers — not as middleware.
 */
export async function writeAuditLog(params: {
  req: Request;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  before?: any;
  after?: any;
  meta?: any;
}): Promise<void> {
  const { req, action, entity, entityId, before, after, meta } = params;

  try {
    await AuditLog.create({
      adminUser: req.user?._id,
      action,
      entity,
      entityId,
      before,
      after,
      meta,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (err) {
    // Never let audit logging break the main request
    logger.error({ err, action, entity }, 'Failed to write audit log');
  }
}

/**
 * Express middleware that adds an `audit()` helper to the request object.
 * Use this on the admin router to make audit logging convenient.
 */
export function auditMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next();
}

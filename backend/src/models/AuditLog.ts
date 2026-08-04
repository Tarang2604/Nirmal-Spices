import mongoose, { Document, Schema } from 'mongoose';

export type AuditAction =
  | 'PRODUCT_CREATE' | 'PRODUCT_UPDATE' | 'PRODUCT_DELETE'
  | 'ORDER_STATUS_UPDATE' | 'ORDER_CANCEL' | 'ORDER_REFUND'
  | 'COUPON_CREATE' | 'COUPON_UPDATE' | 'COUPON_DELETE'
  | 'USER_BLOCK' | 'USER_UNBLOCK' | 'USER_PROMOTE'
  | 'IMAGE_UPLOAD' | 'IMAGE_DELETE'
  | 'REVIEW_APPROVE' | 'REVIEW_DELETE'
  | 'SETTINGS_UPDATE'
  | 'WEBHOOK_RECEIVED';

export type AuditEntity = 'product' | 'order' | 'user' | 'coupon' | 'review' | 'payment' | 'system';

export interface IAuditLog extends Document {
  adminUser: mongoose.Types.ObjectId;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: mongoose.Types.ObjectId | string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    adminUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      required: true,
      enum: [
        'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE',
        'ORDER_STATUS_UPDATE', 'ORDER_CANCEL', 'ORDER_REFUND',
        'COUPON_CREATE', 'COUPON_UPDATE', 'COUPON_DELETE',
        'USER_BLOCK', 'USER_UNBLOCK', 'USER_PROMOTE',
        'IMAGE_UPLOAD', 'IMAGE_DELETE',
        'REVIEW_APPROVE', 'REVIEW_DELETE',
        'SETTINGS_UPDATE',
        'WEBHOOK_RECEIVED',
      ],
    },
    entity: {
      type: String,
      required: true,
      enum: ['product', 'order', 'user', 'coupon', 'review', 'payment', 'system'],
    },
    entityId: { type: Schema.Types.Mixed },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    meta: { type: Schema.Types.Mixed },
    ip: String,
    userAgent: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    // Audit logs are append-only — no updates
  },
);

auditLogSchema.index({ adminUser: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

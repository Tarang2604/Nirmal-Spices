import mongoose, { Document, Schema } from 'mongoose';
import { IAddress } from './User';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'payment-failed';

export type PaymentMethod = 'razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;         // snapshot at purchase time
  image: string;        // snapshot
  weight: string;       // e.g. "100g"
  sku?: string;
  qty: number;
  price: number;        // unit price at purchase time
}

export interface IOrderTimeline {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;   // null for guest orders
  guestEmail?: string;
  guestPhone?: string;
  guestSessionId?: string;
  items: IOrderItem[];
  address: IAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  // Razorpay fields
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  // Order protection
  idempotencyKey: string;           // unique per order attempt
  isWebhookConfirmed: boolean;
  // Financials
  couponCode?: string;
  subtotal: number;
  discount: number;
  shipping: number;
  codCharge: number;
  total: number;
  // Delivery
  status: OrderStatus;
  timeline: IOrderTimeline[];
  trackingNumber?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    weight: { type: String, required: true },
    sku: String,
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderTimelineSchema = new Schema<IOrderTimeline>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false },
);

// Address snapshot (embedded, not a ref — so address changes don't affect old orders)
const addressSnapshotSchema = new Schema(
  {
    label: String,
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    guestEmail: { type: String, lowercase: true },
    guestPhone: String,
    guestSessionId: String,
    items: { type: [orderItemSchema], required: true },
    address: { type: addressSnapshotSchema, required: true },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: String,
    razorpaySignature: String,
    idempotencyKey: { type: String, required: true },
    isWebhookConfirmed: { type: Boolean, default: false },
    couponCode: String,
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    codCharge: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        'pending', 'confirmed', 'processing', 'dispatched',
        'out-for-delivery', 'delivered', 'cancelled', 'refunded', 'payment-failed',
      ],
      default: 'pending',
    },
    timeline: { type: [orderTimelineSchema], default: [] },
    trackingNumber: String,
    estimatedDelivery: Date,
  },
  { timestamps: true },
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ razorpayOrderId: 1 });
orderSchema.index({ idempotencyKey: 1 }, { unique: true });
orderSchema.index({ status: 1 });

// Auto-push to timeline when status changes
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    const lastEntry = this.timeline[this.timeline.length - 1];
    if (!lastEntry || lastEntry.status !== this.status) {
      this.timeline.push({ status: this.status, timestamp: new Date() });
    }
  }
  next();
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);

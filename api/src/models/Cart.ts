import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  weight: string;
  qty: number;
}

export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId;  // null = guest cart
  sessionId?: string;                // guest identifier
  items: ICartItem[];
  expiresAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    weight: { type: String, required: true },
    qty: { type: Number, required: true, min: 1, max: 50 },
  },
  { _id: false },
);

const cartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, index: true },
    items: { type: [cartItemSchema], default: [] },
    // TTL index — MongoDB auto-deletes stale carts after 7 days
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true },
);

// TTL index
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
cartSchema.index({ userId: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });

// Refresh TTL whenever cart is modified
cartSchema.pre('save', function (next) {
  this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  next();
});

export const Cart = mongoose.model<ICart>('Cart', cartSchema);

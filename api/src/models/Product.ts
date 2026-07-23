import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

// Weight variant
export interface IWeightVariant {
  weight: string;    // e.g. "100g", "250g", "500g"
  price: number;
  mrp: number;
  stock: number;
  sku?: string;
}

// SEO metadata
export interface IProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: 'blend-spices' | 'ground-spices' | 'whole-spices' | 'salts-sugars' | 'flour' | 'instant-mix';
  subCategory?: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  usageTips: string[];
  images: string[];          // Cloudinary URLs
  imagePublicIds: string[];  // for deletion
  weights: IWeightVariant[];
  tags: string[];
  badge?: 'bestseller' | 'new' | 'sale' | 'organic' | 'premium';
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  seo: IProductSEO;
  createdAt: Date;
  updatedAt: Date;
}

const weightVariantSchema = new Schema<IWeightVariant>(
  {
    weight: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, trim: true },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['blend-spices', 'ground-spices', 'whole-spices', 'salts-sugars', 'flour', 'instant-mix'],
    },
    subCategory: { type: String, trim: true },
    description: { type: String, required: true, maxlength: 5000 },
    ingredients: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    usageTips: { type: [String], default: [] },
    images: { type: [String], default: [] },
    imagePublicIds: { type: [String], default: [] },
    weights: {
      type: [weightVariantSchema],
      required: true,
      validate: {
        validator: (v: IWeightVariant[]) => v.length > 0,
        message: 'At least one weight variant is required',
      },
    },
    tags: { type: [String], default: [] },
    badge: {
      type: String,
      enum: ['bestseller', 'new', 'sale', 'organic', 'premium'],
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  { timestamps: true },
);

// Indexes
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Auto-generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Virtual: default weight (first variant)
productSchema.virtual('defaultPrice').get(function () {
  return this.weights[0]?.price ?? 0;
});

// Virtual: total stock across all variants
productSchema.virtual('totalStock').get(function () {
  return this.weights.reduce((sum, w) => sum + w.stock, 0);
});

export const Product = mongoose.model<IProduct>('Product', productSchema);

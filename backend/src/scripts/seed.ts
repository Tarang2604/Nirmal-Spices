/**
 * Seed admin user + catalog products + fees + sample coupon.
 * Usage: npm run seed
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { Category } from '../models/Category';
import { getOrCreateStoreSettings } from '../models/StoreSettings';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CATEGORY_MAP: Record<string, string> = {
  'blended-masalas': 'blended-masalas',
  'ground-spices': 'ground-spices',
  'whole-spices': 'whole-spices',
  salts: 'salts',
  'instant-mix': 'instant-mix',
  // legacy aliases → canonical storefront slugs
  'blend-spices': 'blended-masalas',
  'salts-sugars': 'salts',
};

const BADGE_MAP: Record<string, string | undefined> = {
  'best-seller': 'bestseller',
  new: 'new',
  sale: 'sale',
};

interface CatalogProduct {
  name: string;
  slug: string;
  categorySlug: string;
  brand?: string;
  description: string;
  shortDescription?: string;
  ingredients?: string;
  usageSuggestions?: string;
  shelfLife?: string;
  storageInstructions?: string;
  nutritionalNotes?: string;
  images: string[];
  tags: string[];
  badge: string | null;
  rating: number;
  reviewCount: number;
  packSize: string;
  price: number;
  salePrice: number | null;
  inStock: boolean;
  seo?: { title?: string; description?: string; keywords?: string[] };
}

function loadCatalogProducts(): CatalogProduct[] {
  const jsonPath = path.resolve(__dirname, 'catalog.seed.json');
  if (!fs.existsSync(jsonPath)) {
    console.warn('catalog.seed.json not found — skipping product seed.');
    return [];
  }
  return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as CatalogProduct[];
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  // Enforce a single admin account
  await User.updateMany(
    { role: 'admin', email: { $ne: email } },
    { $set: { role: 'user' } },
  );

  let user = await User.findOne({ email }).select('+password');
  if (!user) {
    user = await User.create({
      name: "Nirmal's Admin",
      email,
      password,
      role: 'admin',
      isVerified: true,
      isBlocked: false,
    });
    console.log(`Admin created: ${email} / ${password}`);
  } else {
    user.name = user.name || "Nirmal's Admin";
    user.role = 'admin';
    user.isVerified = true;
    user.isBlocked = false;
    user.password = password;
    await user.save();
    console.log(`Admin updated: ${email} / ${password}`);
  }

  const adminCount = await User.countDocuments({ role: 'admin' });
  console.log(`Admin accounts in DB: ${adminCount} (expected 1)`);
}

async function seedCategories() {
  const defaults = [
    { name: 'Blended Masalas', slug: 'blended-masalas', description: 'Authentic ready masala blends', sortOrder: 1, image: '/masala_collection.png' },
    { name: 'Ground Spices', slug: 'ground-spices', description: 'Pure stone-ground powders', sortOrder: 2, image: '/spices_flatlay.png' },
    { name: 'Whole Spices', slug: 'whole-spices', description: 'Naturally dried aromatic seeds', sortOrder: 3, image: '/hero_spices.png' },
    { name: 'Salts', slug: 'salts', description: 'Sendha Namak & Kala Namak', sortOrder: 4, image: '/hero_spices.png' },
    { name: 'Instant Mix', slug: 'instant-mix', description: 'Idli Mix & Gulab Jamun Mix', sortOrder: 5, image: '/masala_collection.png' },
  ];

  for (const cat of defaults) {
    await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: { ...cat, isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  // Migrate legacy product category keys to storefront slugs
  await Product.updateMany({ category: 'blend-spices' }, { $set: { category: 'blended-masalas' } });
  await Product.updateMany({ category: 'salts-sugars' }, { $set: { category: 'salts' } });

  console.log(`Categories upserted: ${defaults.length}`);
}

async function seedProducts() {
  const catalog = loadCatalogProducts();
  if (catalog.length === 0) return;

  let upserted = 0;
  for (const item of catalog) {
    const category = CATEGORY_MAP[item.categorySlug] || item.categorySlug || 'blended-masalas';
    const badge = item.badge ? BADGE_MAP[item.badge] : undefined;
    const price = item.salePrice ?? item.price;
    const mrp = item.price;

    await Product.findOneAndUpdate(
      { slug: item.slug },
      {
        $set: {
          name: item.name,
          slug: item.slug,
          category,
          brand: item.brand || "Nirmal's Spices",
          shortDescription: item.shortDescription || '',
          description: item.description || item.shortDescription || item.name,
          ingredients: item.ingredients
            ? item.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          usageTips: item.usageSuggestions ? [item.usageSuggestions] : [],
          benefits: item.nutritionalNotes ? [item.nutritionalNotes] : [],
          shelfLife: item.shelfLife || '',
          storageInstructions: item.storageInstructions || '',
          images: item.images || [],
          imagePublicIds: [],
          weights: [
            {
              weight: item.packSize,
              price,
              mrp,
              stock: item.inStock === false ? 0 : 100,
            },
          ],
          tags: item.tags || [],
          badge,
          rating: item.rating || 0,
          reviewCount: item.reviewCount || 0,
          isActive: true,
          isFeatured: item.badge === 'best-seller',
          seo: item.seo || {},
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    upserted += 1;
  }
  console.log(`Products upserted: ${upserted}`);
}

async function seedCoupon() {
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await Coupon.findOneAndUpdate(
    { code: 'FIRST10' },
    {
      $set: {
        code: 'FIRST10',
        title: 'First Order 10% Off',
        type: 'percent',
        value: 10,
        minOrder: 299,
        maxUses: 10000,
        expiresAt,
        isActive: true,
        oncePerUser: true,
        startsAt: new Date(),
        description: '10% off first orders (min ₹299)',
      },
      $setOnInsert: { usedCount: 0, usedBy: [] },
    },
    { upsert: true, new: true },
  );
  console.log('Coupon ensured: FIRST10 (10% off, min ₹299)');
}

async function seedSettings() {
  const settings = await getOrCreateStoreSettings();
  let dirty = false;
  if (settings.commissionValue === 0 && settings.platformFeeValue === 0) {
    settings.commissionType = 'percent';
    settings.commissionValue = 5;
    settings.platformFeeType = 'flat';
    settings.platformFeeValue = 10;
    dirty = true;
  }
  if (settings.deliveryCharge == null) {
    settings.deliveryCharge = 40;
    dirty = true;
  }
  if (settings.freeDeliveryMin == null) {
    settings.freeDeliveryMin = 499;
    dirty = true;
  }
  if (dirty) await settings.save();
  console.log(
    `Fees: commission ${settings.commissionValue}${settings.commissionType === 'percent' ? '%' : '₹'} | platform ${settings.platformFeeValue}${settings.platformFeeType === 'percent' ? '%' : '₹'} | delivery ₹${settings.deliveryCharge} (free ≥ ₹${settings.freeDeliveryMin})`,
  );
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await seedAdmin();
  await seedCategories();
  await seedProducts();
  await seedCoupon();
  await seedSettings();

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

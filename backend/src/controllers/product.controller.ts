import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { redisGet, redisSet, redisDel, redisDelPattern, RedisKeys } from '../config/redis';
import { deleteCloudinaryAsset, resolveUploadedImage } from '../config/cloudinary';
import { writeAuditLog } from '../middleware/audit';
import crypto from 'crypto';

// Cache TTL: 5 minutes
const CACHE_TTL = 300;

/** Map legacy / alternate category slugs to canonical Category.slug values */
const CATEGORY_ALIASES: Record<string, string> = {
  'blended-masalas': 'blended-masalas',
  'blend-spices': 'blended-masalas',
  'ground-spices': 'ground-spices',
  'whole-spices': 'whole-spices',
  salts: 'salts',
  'salts-sugars': 'salts',
  'instant-mix': 'instant-mix',
  flour: 'flours',
  flours: 'flours',
};

const BADGE_ALIASES: Record<string, string> = {
  'best-seller': 'bestseller',
  bestseller: 'bestseller',
  new: 'new',
  sale: 'sale',
  organic: 'organic',
  premium: 'premium',
};

function normalizeCategory(raw?: string): string | undefined {
  if (!raw) return undefined;
  return CATEGORY_ALIASES[raw] ?? raw;
}

function normalizeBadge(raw?: string): string | undefined {
  if (!raw) return undefined;
  return BADGE_ALIASES[raw] ?? raw;
}

// ── GET ALL PRODUCTS (with filters, sorting, paginating, and Redis cache) ─────────
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const queryObj = { ...req.query };
  const excludeFields = ['page', 'sort', 'limit', 'fields', 'search', 'q', 'cat'];
  excludeFields.forEach((el) => delete queryObj[el]);

  // Create hash from query params for Redis cache key
  const queryStr = JSON.stringify(req.query);
  const queryHash = crypto.createHash('md5').update(queryStr).digest('hex');
  const cacheKey = RedisKeys.productsCache(queryHash);

  // Check cache
  const cachedData = await redisGet(cacheKey);
  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    return sendSuccess(res, parsed.products, 'Products fetched (cached)', 200, parsed.meta);
  }

  // Construct filters
  const filter: Record<string, any> = { isActive: true };

  const category = normalizeCategory(
    (req.query.category as string) || (req.query.cat as string) || undefined
  );
  if (category) {
    // Include legacy alias slugs so older product docs still match
    const aliases = Object.entries(CATEGORY_ALIASES)
      .filter(([, canonical]) => canonical === category)
      .map(([alias]) => alias);
    filter.category = { $in: [...new Set([category, ...aliases])] };
  }

  const badge = normalizeBadge(req.query.badge as string | undefined);
  if (badge) {
    filter.badge = badge;
  }

  if (req.query.minPrice || req.query.maxPrice) {
    filter['weights.price'] = {};
    if (req.query.minPrice) filter['weights.price'].$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter['weights.price'].$lte = Number(req.query.maxPrice);
  }

  const search = (req.query.search as string) || (req.query.q as string);
  if (search) {
    filter.$text = { $search: search };
  }

  // Sorting
  let sortBy: string | Record<string, any> = '-createdAt';
  if (search) {
    sortBy = { score: { $meta: 'textScore' } };
  } else if (req.query.sort) {
    const sortField = req.query.sort as string;
    if (sortField === 'price-asc') sortBy = 'weights.0.price';
    else if (sortField === 'price-desc') sortBy = '-weights.0.price';
    else if (sortField === 'rating') sortBy = '-rating';
    else if (sortField === 'newest') sortBy = '-createdAt';
    else sortBy = sortField;
  }

  // Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const total = await Product.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  if (skip >= total && total > 0) {
    throw ApiError.badRequest('Page out of bounds');
  }

  let query = Product.find(filter);
  if (search) {
    query = query.select({ score: { $meta: 'textScore' } }) as typeof query;
  }

  const products = await query.sort(sortBy as string | Record<string, 1 | -1>).skip(skip).limit(limit).lean();

  const meta = { page, limit, total, totalPages };

  // Set Cache
  await redisSet(cacheKey, JSON.stringify({ products, meta }), CACHE_TTL);

  return sendSuccess(res, products, 'Products fetched', 200, meta);
});

/** Admin list — all products including inactive */
export const getAdminProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const skip = (page - 1) * limit;
  const category = normalizeCategory(
    (req.query.category as string) || (req.query.cat as string) || undefined,
  );
  const search = String(req.query.search || req.query.q || '').trim();

  const filter: Record<string, any> = {};
  if (category) {
    const aliases = Object.entries(CATEGORY_ALIASES)
      .filter(([, canonical]) => canonical === category)
      .map(([alias]) => alias);
    filter.category = { $in: [...new Set([category, ...aliases])] };
  }
  if (req.query.active === 'true') filter.isActive = true;
  if (req.query.active === 'false') filter.isActive = false;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return sendSuccess(res, products, 'Admin products fetched', 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  });
});

// ── GET SINGLE PRODUCT BY SLUG (cached) ─────────────────────────────
export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const cacheKey = RedisKeys.productCache(slug);

  const cachedProduct = await redisGet(cacheKey);
  if (cachedProduct) {
    return sendSuccess(res, JSON.parse(cachedProduct), 'Product details fetched (cached)');
  }

  const product = await Product.findOne({ slug, isActive: true }).lean();
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Cache single product details
  await redisSet(cacheKey, JSON.stringify(product), CACHE_TTL);

  return sendSuccess(res, product, 'Product details fetched');
});

// ── TEXT SEARCH PRODUCTS ─────────────────────────────────────────────
export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    throw ApiError.badRequest('Search query "q" is required');
  }

  // MongoDB Text Index search
  const products = await Product.find(
    { $text: { $search: q }, isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .lean();

  return sendSuccess(res, products, `Search results for: ${q}`);
});

// ── CREATE PRODUCT (Admin + Audit log + cache clear) ────────────────
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  
  let imageUrls: string[] = [];
  let publicIds: string[] = [];

  if (files && files.length > 0) {
    const resolved = files
      .map((f) => resolveUploadedImage(f, 'products'))
      .filter(Boolean) as { url: string; publicId: string }[];
    imageUrls = resolved.map((r) => r.url);
    publicIds = resolved.map((r) => r.publicId).filter(Boolean);
  }

  const categorySlug = normalizeCategory(req.body.category) || req.body.category;
  const categoryExists = await Category.findOne({ slug: categorySlug, isActive: true });
  if (!categoryExists) {
    throw ApiError.badRequest('Invalid category — create it under Categories first');
  }

  const productData = {
    ...req.body,
    category: categorySlug,
    images: imageUrls,
    imagePublicIds: publicIds,
    // Always live on storefront unless admin explicitly deactivates
    isActive: req.body.isActive === false || req.body.isActive === 'false' ? false : true,
  };

  const product = await Product.create(productData);

  // Invalidate all products list caches
  await redisDelPattern('products:*');

  // Write admin audit log
  void writeAuditLog({
    req,
    action: 'PRODUCT_CREATE',
    entity: 'product',
    entityId: product._id.toString(),
    after: product.toObject(),
  });

  return sendSuccess(res, product, 'Product created successfully', 201);
});

// ── UPDATE PRODUCT (Admin + Audit log + cache invalidation) ─────────
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[] | undefined;

  const originalProduct = await Product.findById(id);
  if (!originalProduct) {
    throw ApiError.notFound('Product not found');
  }

  const beforeState = originalProduct.toObject();
  let updatedData = { ...req.body };

  // Handle image upload updates
  if (files && files.length > 0) {
    const resolved = files
      .map((f) => resolveUploadedImage(f, 'products'))
      .filter(Boolean) as { url: string; publicId: string }[];
    const imageUrls = resolved.map((r) => r.url);
    const publicIds = resolved.map((r) => r.publicId).filter(Boolean);
    
    // Append or overwrite images
    if (req.body.overwriteImages === 'true') {
      // Delete old assets first
      for (const pid of originalProduct.imagePublicIds) {
        try { await deleteCloudinaryAsset(pid); } catch {}
      }
      updatedData.images = imageUrls;
      updatedData.imagePublicIds = publicIds;
    } else {
      updatedData.images = [...originalProduct.images, ...imageUrls];
      updatedData.imagePublicIds = [...originalProduct.imagePublicIds, ...publicIds];
    }
  }

  // Update in DB
  const product = await Product.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Invalidate specific cache and list caches
  await redisDel(RedisKeys.productCache(product.slug));
  if (originalProduct.slug !== product.slug) {
    await redisDel(RedisKeys.productCache(originalProduct.slug));
  }
  await redisDelPattern('products:*');

  // Write audit log
  void writeAuditLog({
    req,
    action: 'PRODUCT_UPDATE',
    entity: 'product',
    entityId: product._id.toString(),
    before: beforeState,
    after: product.toObject(),
  });

  return sendSuccess(res, product, 'Product updated successfully');
});

// ── DELETE PRODUCT (Admin + Audit log + cache clear + Cloudinary clean) ──
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Soft-delete: mark inactive so storefront hides it; keep media for history
  const beforeState = product.toObject();
  product.isActive = false;
  await product.save();

  // Clear cache
  await redisDel(RedisKeys.productCache(product.slug));
  await redisDelPattern('products:*');

  // Write audit log
  void writeAuditLog({
    req,
    action: 'PRODUCT_DELETE',
    entity: 'product',
    entityId: product._id.toString(),
    before: beforeState,
    after: { isActive: false },
  });

  return sendSuccess(res, null, 'Product deactivated successfully');
});

// ── BULK IMPORT PRODUCTS FROM CSV / EXCEL (Admin) ────────────────────
export const bulkImportProducts = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) throw ApiError.badRequest('Upload a CSV or Excel (.xlsx) file');

  const XLSX = await import('xlsx');
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw ApiError.badRequest('Spreadsheet has no sheets');

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  if (!rows.length) throw ApiError.badRequest('File has no data rows');

  const categories = await Category.find({ isActive: true }).lean();
  const validSlugs = new Set(categories.map((c) => c.slug));

  const created: string[] = [];
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // header is row 1
    try {
      const name = String(row.name || row.Name || '').trim();
      const categoryRaw = String(row.category || row.Category || '').trim().toLowerCase();
      const category = normalizeCategory(categoryRaw) || categoryRaw;
      const description = String(row.description || row.Description || name).trim();
      const weight = String(row.weight || row.Weight || '100g').trim();
      const price = Number(row.price || row.Price || 0);
      const mrp = Number(row.mrp || row.MRP || price);
      const stock = Number(row.stock || row.Stock || 0);
      const image = String(row.image || row.Image || '').trim();

      if (!name) throw new Error('name is required');
      if (!category || !validSlugs.has(category)) {
        throw new Error(`invalid category "${categoryRaw}" — use an existing category slug`);
      }
      if (price < 0 || mrp < 0 || stock < 0) throw new Error('price/mrp/stock must be >= 0');

      const product = await Product.create({
        name,
        category,
        description: description.length >= 10 ? description : `${description} — Nirmal's Spices.`,
        ingredients: String(row.ingredients || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        weights: [{ weight, price, mrp: mrp || price, stock }],
        images: image ? [image] : [],
        tags: String(row.tags || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        isActive: true,
        isFeatured: false,
      });
      created.push(product.slug);
    } catch (err: any) {
      errors.push({ row: rowNum, message: err?.message || 'Failed to import row' });
    }
  }

  await redisDelPattern('products:*');

  void writeAuditLog({
    req,
    action: 'PRODUCT_BULK_IMPORT',
    entity: 'product',
    after: { created: created.length, errors: errors.length },
  });

  return sendSuccess(
    res,
    { createdCount: created.length, created, errors },
    `Imported ${created.length} product(s)`,
  );
});

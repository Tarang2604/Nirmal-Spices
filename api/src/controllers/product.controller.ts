import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { redisGet, redisSet, redisDel, redisDelPattern, RedisKeys } from '../config/redis';
import { deleteCloudinaryAsset } from '../config/cloudinary';
import { writeAuditLog } from '../middleware/audit';
import crypto from 'crypto';

// Cache TTL: 5 minutes
const CACHE_TTL = 300;

// ── GET ALL PRODUCTS (with filters, sorting, paginating, and Redis cache) ─────────
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const queryObj = { ...req.query };
  const excludeFields = ['page', 'sort', 'limit', 'fields'];
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

  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.badge) {
    filter.badge = req.query.badge;
  }
  if (req.query.minPrice || req.query.maxPrice) {
    filter['weights.price'] = {};
    if (req.query.minPrice) filter['weights.price'].$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter['weights.price'].$lte = Number(req.query.maxPrice);
  }

  // Sorting
  let sortBy = '-createdAt';
  if (req.query.sort) {
    const sortField = req.query.sort as string;
    if (sortField === 'price-asc') sortBy = 'weights.0.price';
    else if (sortField === 'price-desc') sortBy = '-weights.0.price';
    else if (sortField === 'rating') sortBy = '-rating';
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

  const products = await Product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .lean();

  const meta = { page, limit, total, totalPages };

  // Set Cache
  await redisSet(cacheKey, JSON.stringify({ products, meta }), CACHE_TTL);

  return sendSuccess(res, products, 'Products fetched', 200, meta);
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
    imageUrls = files.map((f: any) => f.path || f.secure_url);
    publicIds = files.map((f: any) => f.filename || f.public_id);
  }

  const productData = {
    ...req.body,
    images: imageUrls,
    imagePublicIds: publicIds,
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
    const imageUrls = files.map((f: any) => f.path || f.secure_url);
    const publicIds = files.map((f: any) => f.filename || f.public_id);
    
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

  // Soft delete by marking inactive, or hard delete? Let's do hard delete to clean Cloudinary
  const beforeState = product.toObject();

  // Delete associated images from Cloudinary
  for (const pid of product.imagePublicIds) {
    try {
      await deleteCloudinaryAsset(pid);
    } catch (err) {
      // log error but continue
    }
  }

  await product.deleteOne();

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
  });

  return sendSuccess(res, null, 'Product and its media deleted successfully');
});

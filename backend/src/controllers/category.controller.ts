import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { deleteCloudinaryAsset, resolveUploadedImage } from '../config/cloudinary';
import slugify from 'slugify';

/** Public: active categories with live product counts */
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();

  const counts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id, c.count]));

  const data = categories.map((c) => ({
    ...c,
    count: countMap.get(c.slug) ?? 0,
  }));

  return sendSuccess(res, data, 'Categories fetched');
});

/** Admin: all categories */
export const getAdminCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
  const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((c) => [c._id, c.count]));

  const data = categories.map((c) => ({
    ...c,
    count: countMap.get(c.slug) ?? 0,
  }));

  return sendSuccess(res, data, 'Admin categories fetched');
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, sortOrder, isActive } = req.body;
  if (!name || String(name).trim().length < 2) {
    throw ApiError.badRequest('Category name is required');
  }

  const slug =
    (req.body.slug && String(req.body.slug).trim()) ||
    slugify(String(name), { lower: true, strict: true });

  const exists = await Category.findOne({ slug });
  if (exists) throw ApiError.conflict('Category slug already exists');

  const uploaded = resolveUploadedImage(req.file, 'categories');

  const category = await Category.create({
    name: String(name).trim(),
    slug,
    description: description || '',
    image: uploaded?.url || '',
    imagePublicId: uploaded?.publicId || '',
    sortOrder: Number(sortOrder) || 0,
    isActive: isActive !== false && isActive !== 'false',
  });

  return sendSuccess(res, category.toJSON ? category.toJSON() : category, 'Category created', 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const prevSlug = category.slug;

  if (req.body.name !== undefined) category.name = String(req.body.name).trim();
  if (req.body.description !== undefined) category.description = String(req.body.description);
  if (req.body.sortOrder !== undefined) category.sortOrder = Number(req.body.sortOrder) || 0;
  if (req.body.isActive !== undefined) {
    category.isActive = req.body.isActive === true || req.body.isActive === 'true';
  }
  if (req.body.slug !== undefined && String(req.body.slug).trim()) {
    category.slug = slugify(String(req.body.slug), { lower: true, strict: true });
  }

  const uploaded = resolveUploadedImage(req.file, 'categories');
  if (uploaded) {
    if (category.imagePublicId) {
      try {
        await deleteCloudinaryAsset(category.imagePublicId);
      } catch {
        /* ignore delete errors */
      }
    }
    // Remove previous local file if replacing
    if (category.image?.startsWith('/uploads/') && !category.imagePublicId) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const prev = path.join(process.cwd(), category.image.replace(/^\//, ''));
        if (fs.existsSync(prev)) fs.unlinkSync(prev);
      } catch {
        /* ignore */
      }
    }
    category.image = uploaded.url;
    category.imagePublicId = uploaded.publicId;
  }

  await category.save();

  if (category.slug !== prevSlug) {
    await Product.updateMany({ category: prevSlug }, { $set: { category: category.slug } });
  }

  return sendSuccess(res, category, 'Category updated');
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const productCount = await Product.countDocuments({ category: category.slug, isActive: true });
  if (productCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete category with ${productCount} active product(s). Move or deactivate products first.`,
    );
  }

  if (category.imagePublicId) {
    try {
      await deleteCloudinaryAsset(category.imagePublicId);
    } catch {
      /* ignore */
    }
  }

  await category.deleteOne();
  return sendSuccess(res, null, 'Category deleted');
});

import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { verifyAuth, requireAdmin } from '../middleware/auth';
import { uploadCategoryImage } from '../config/cloudinary';
import { uploadLimiter } from '../middleware/rateLimit';

const router = Router();

router.get('/', categoryController.getCategories);

router.get('/admin/all', verifyAuth, requireAdmin, categoryController.getAdminCategories);
router.post(
  '/',
  verifyAuth,
  requireAdmin,
  uploadLimiter,
  uploadCategoryImage.single('image'),
  categoryController.createCategory,
);
router.put(
  '/:id',
  verifyAuth,
  requireAdmin,
  uploadLimiter,
  uploadCategoryImage.single('image'),
  categoryController.updateCategory,
);
router.delete('/:id', verifyAuth, requireAdmin, categoryController.deleteCategory);

export default router;

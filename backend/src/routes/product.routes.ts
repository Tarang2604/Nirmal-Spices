import { Router } from 'express';
import multer from 'multer';
import * as productController from '../controllers/product.controller';
import { verifyAuth, requireAdmin } from '../middleware/auth';
import { uploadProductImages } from '../config/cloudinary';
import { uploadLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();
const bulkUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype.includes('sheet') ||
      file.mimetype.includes('excel') ||
      file.mimetype === 'text/csv' ||
      file.originalname.match(/\.(csv|xlsx|xls)$/i);
    cb(null, Boolean(ok));
  },
});

// Public routes
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get(
  '/admin/all',
  verifyAuth,
  requireAdmin,
  productController.getAdminProducts,
);
router.get('/:slug', productController.getProductBySlug);

// Admin-only write endpoints
router.use(verifyAuth, requireAdmin);

router.post(
  '/bulk',
  uploadLimiter,
  bulkUpload.single('file'),
  productController.bulkImportProducts,
);

router.post(
  '/',
  uploadLimiter,
  uploadProductImages.array('images', 5),
  validate(createProductSchema),
  productController.createProduct
);

router.put(
  '/:id',
  uploadLimiter,
  uploadProductImages.array('images', 5),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete('/:id', productController.deleteProduct);

export default router;

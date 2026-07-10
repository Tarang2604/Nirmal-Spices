import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { verifyAuth, requireAdmin } from '../middleware/auth';
import { uploadProductImages } from '../config/cloudinary';
import { uploadLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/:slug', productController.getProductBySlug);

// Admin-only write endpoints
router.use(verifyAuth, requireAdmin);

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

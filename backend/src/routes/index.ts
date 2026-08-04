import { Router } from 'express';
import authRouter from './auth.routes';
import productRouter from './product.routes';
import categoryRouter from './category.routes';
import cartRouter from './cart.routes';
import orderRouter from './order.routes';
import couponRouter from './coupon.routes';
import reviewRouter from './review.routes';
import contactRouter from './contact.routes';
import adminRouter from './admin.routes';
import wishlistRouter from './wishlist.routes';
import settingsRouter from './settings.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/categories', categoryRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/coupons', couponRouter);
router.use('/reviews', reviewRouter);
router.use('/contact', contactRouter);
router.use('/admin', adminRouter);
router.use('/wishlist', wishlistRouter);
router.use('/settings', settingsRouter);

export default router;

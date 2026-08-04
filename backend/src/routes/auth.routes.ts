import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { verifyAuth } from '../middleware/auth';
import { authLimiter, otpLimiter } from '../middleware/rateLimit';
import * as schemas from '../validators/auth.validator';

const router = Router();

// Public auth
router.post('/register', authLimiter, validate(schemas.registerSchema), authController.register);
router.post('/login', authLimiter, validate(schemas.loginSchema), authController.login);
router.post('/admin/login', authLimiter, validate(schemas.loginSchema), authController.adminLogin);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// OTP
router.post('/send-otp', otpLimiter, validate(schemas.sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', otpLimiter, validate(schemas.verifyOtpSchema), authController.verifyOtp);

// Forgot/Reset Password
router.post('/forgot-password', authLimiter, validate(schemas.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(schemas.resetPasswordSchema), authController.resetPassword);

// Protected routes (require verified JWT access token)
router.use(verifyAuth);

router.get('/me', authController.getMe);
router.put('/me', validate(schemas.updateProfileSchema), authController.updateProfile);
router.delete('/me', authController.deleteAccount);

// Address Management
router.post('/addresses', validate(schemas.addressSchema), authController.addAddress);
router.put('/addresses/:addressId', validate(schemas.addressSchema), authController.updateAddress);
router.delete('/addresses/:addressId', authController.deleteAddress);

export default router;

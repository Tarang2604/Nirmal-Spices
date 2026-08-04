import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const sendOtpSchema = z.object({
  identifier: z.string().refine(
    (val) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isPhone = /^[6-9]\d{9}$/.test(val);
      return isEmail || isPhone;
    },
    { message: 'Must be a valid email or 10-digit Indian phone number' }
  ),
  type: z.enum(['login', 'register', 'reset-password', 'phone-verify']),
});

export const verifyOtpSchema = z.object({
  identifier: z.string().refine(
    (val) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isPhone = /^[6-9]\d{9}$/.test(val);
      return isEmail || isPhone;
    },
    { message: 'Must be a valid email or 10-digit Indian phone number' }
  ),
  code: z.string().length(6, 'OTP must be exactly 6 digits'),
  type: z.enum(['login', 'register', 'reset-password', 'phone-verify']),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number').optional().or(z.literal('')),
});

export const addressSchema = z.object({
  label: z.enum(['home', 'work', 'other']),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  line1: z.string().min(5, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Must be a valid 6-digit PIN code'),
  isDefault: z.boolean().default(false),
});

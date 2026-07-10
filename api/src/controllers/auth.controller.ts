import { Request, Response } from 'express';
import { User, IAddress } from '../models/User';
import { OTP } from '../models/OTP';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { issueTokenPair, clearAuthCookies, REFRESH_COOKIE, verifyRefreshToken, revokeRefreshToken, revokeAllRefreshTokens } from '../utils/jwt';
import { sendWelcomeEmail, sendOTPEmail, sendPasswordResetEmail } from '../services/email.service';
import { sendSMSOTP } from '../services/sms.service';
import crypto from 'crypto';
import { env } from '../config/env';

// ── REGISTER ─────────────────────────────────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict('Email is already registered');
  }

  if (phone) {
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      throw ApiError.conflict('Phone number is already registered');
    }
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
  });

  // Send welcome email async
  void sendWelcomeEmail(user.email, user.name);

  await issueTokenPair(res, user._id.toString(), user.role);

  return sendSuccess(res, user, 'Registration successful', 201);
});

// ── LOGIN ────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.isBlocked) {
    throw ApiError.forbidden('Your account has been suspended');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  await issueTokenPair(res, user._id.toString(), user.role);

  return sendSuccess(res, user, 'Login successful');
});

// ── REFRESH TOKEN ROTATION ───────────────────────────────────────────
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;

  if (!token) {
    throw ApiError.unauthorized('Refresh token missing');
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const { sub: userId, tokenId } = payload;

  // Verify and rotate in Redis (checking rt:userId:tokenId exists)
  const redisKey = `rt:${userId}:${tokenId}`;
  const { getRedis } = require('../config/redis');
  const redis = getRedis();
  const exists = await redis.exists(redisKey);

  if (!exists) {
    // Stolen or reused token! Revoke ALL refresh tokens for safety
    await revokeAllRefreshTokens(userId);
    clearAuthCookies(res);
    throw ApiError.unauthorized('Token reuse detected — please log in again');
  }

  // Revoke used token
  await revokeRefreshToken(userId, tokenId);

  // Retrieve user to verify role and status
  const user = await User.findById(userId).select('_id role isBlocked');
  if (!user || user.isBlocked) {
    clearAuthCookies(res);
    throw ApiError.forbidden('User not found or suspended');
  }

  // Issue new pair (rotation)
  await issueTokenPair(res, user._id.toString(), user.role);

  return sendSuccess(res, { role: user.role }, 'Token refreshed successfully');
});

// ── LOGOUT ───────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;

  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await revokeRefreshToken(payload.sub, payload.tokenId);
    } catch {
      // Ignore token verification errors during logout
    }
  }

  clearAuthCookies(res);
  return sendSuccess(res, null, 'Logged out successfully');
});

// ── SEND OTP ─────────────────────────────────────────────────────────
export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, type } = req.body;
  const isEmail = identifier.includes('@');

  // Generate 6-digit numeric OTP
  const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store hashed OTP in database with 5 min TTL
  const hashedOtp = await crypto.createHash('sha256').update(rawOtp).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Save using Mongoose OTP model
  await OTP.findOneAndUpdate(
    { identifier: identifier.toLowerCase(), type },
    { hashedCode: hashedOtp, expiresAt, attempts: 0 },
    { upsert: true, new: true }
  );

  let sent = false;
  if (isEmail) {
    void sendOTPEmail(identifier, rawOtp, type);
    sent = true;
  } else {
    sent = await sendSMSOTP(identifier, rawOtp);
  }

  if (!sent) {
    throw ApiError.internal('Failed to deliver OTP');
  }

  return sendSuccess(res, null, `OTP sent successfully to ${isEmail ? 'email' : 'mobile'}`);
});

// ── VERIFY OTP ───────────────────────────────────────────────────────
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, code, type } = req.body;

  const otpRecord = await OTP.findOne({ identifier: identifier.toLowerCase(), type });

  if (!otpRecord) {
    throw ApiError.badRequest('OTP expired or not found');
  }

  if (otpRecord.expiresAt < new Date()) {
    await otpRecord.deleteOne();
    throw ApiError.badRequest('OTP has expired');
  }

  if (otpRecord.attempts >= 5) {
    await otpRecord.deleteOne();
    throw ApiError.tooMany('Too many incorrect attempts — please request a new OTP');
  }

  const hashedInput = crypto.createHash('sha256').update(code).digest('hex');
  if (otpRecord.hashedCode !== hashedInput) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw ApiError.badRequest('Invalid OTP');
  }

  // OTP verified successfully
  await otpRecord.deleteOne();

  // If this is login or register verify, generate token session
  if (type === 'login' || type === 'register') {
    let user = await User.findOne(
      isEmail(identifier) ? { email: identifier.toLowerCase() } : { phone: identifier }
    );

    if (!user) {
      if (type === 'login') {
        throw ApiError.notFound('Account not found. Please register first.');
      }
      // Auto-register on verify-otp if type is register
      user = await User.create({
        name: 'Spice Lover',
        email: isEmail(identifier) ? identifier.toLowerCase() : `otp_${identifier}@nirmalspices.in`,
        phone: !isEmail(identifier) ? identifier : undefined,
        password: crypto.randomBytes(16).toString('hex'), // temp random password
        isVerified: true,
      });
      void sendWelcomeEmail(user.email, user.name);
    }

    if (user.isBlocked) {
      throw ApiError.forbidden('Your account has been suspended');
    }

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    await issueTokenPair(res, user._id.toString(), user.role);
    return sendSuccess(res, user, 'OTP verified successfully');
  }

  return sendSuccess(res, null, 'OTP verified successfully');
});

// ── FORGOT PASSWORD ──────────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Security best practice: don't reveal if user exists, return success
    return sendSuccess(res, null, 'If this email is registered, a password reset link has been sent');
  }

  // Generate signed reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Reuse OTP model for reset token tracking to avoid model bloat
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
  await OTP.findOneAndUpdate(
    { identifier: email.toLowerCase(), type: 'reset-password' },
    { hashedCode: hashedToken, expiresAt, attempts: 0 },
    { upsert: true }
  );

  const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}?email=${encodeURIComponent(email)}`;
  void sendPasswordResetEmail(email, resetUrl);

  return sendSuccess(res, null, 'Password reset link sent');
});

// ── RESET PASSWORD ───────────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;
  const email = req.query.email as string | undefined;

  if (!email) {
    throw ApiError.badRequest('Email parameter is required');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const otpRecord = await OTP.findOne({
    identifier: email.toLowerCase(),
    type: 'reset-password',
    hashedCode: hashedToken,
  });

  if (!otpRecord) {
    throw ApiError.badRequest('Invalid or expired password reset link');
  }

  if (otpRecord.expiresAt < new Date()) {
    await otpRecord.deleteOne();
    throw ApiError.badRequest('Password reset link has expired');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Update password
  user.password = password;
  await user.save();

  // Clean token
  await otpRecord.deleteOne();

  // Revoke all existing login sessions for security
  await revokeAllRefreshTokens(user._id.toString());

  return sendSuccess(res, null, 'Password reset successful. Please login with your new password.');
});

// ── GET CURRENT USER ─────────────────────────────────────────────────
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const user = await User.findById(req.user._id);
  return sendSuccess(res, user);
});

// ── UPDATE PROFILE ───────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  const { name, phone } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (name) user.name = name;
  if (phone) {
    const existingPhone = await User.findOne({ phone, _id: { $ne: user._id } });
    if (existingPhone) {
      throw ApiError.conflict('Phone number is already in use');
    }
    user.phone = phone;
  }

  await user.save();
  return sendSuccess(res, user, 'Profile updated successfully');
});

// ── ADDRESS MANAGEMENT ───────────────────────────────────────────────
export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const addressData = req.body as IAddress;
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound();

  if (addressData.isDefault) {
    // reset other default addresses
    user.addresses.forEach((addr) => (addr.isDefault = false));
  } else if (user.addresses.length === 0) {
    addressData.isDefault = true;
  }

  user.addresses.push(addressData);
  await user.save();

  return sendSuccess(res, user.addresses, 'Address added successfully');
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const { addressId } = req.params;
  const addressData = req.body as Partial<IAddress>;
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound();

  const address = user.addresses.find((addr: any) => addr._id.toString() === addressId);
  if (!address) throw ApiError.notFound('Address not found');

  if (addressData.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  Object.assign(address, addressData);
  await user.save();

  return sendSuccess(res, user.addresses, 'Address updated successfully');
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const { addressId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound();

  const addressIndex = user.addresses.findIndex((addr: any) => addr._id.toString() === addressId);
  if (addressIndex === -1) throw ApiError.notFound('Address not found');

  const wasDefault = user.addresses[addressIndex].isDefault;
  
  // Remove the subdocument from array
  user.addresses.splice(addressIndex, 1);

  // If we deleted the default address and have others, make the first one default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return sendSuccess(res, user.addresses, 'Address deleted successfully');
});

// Helper functions
function isEmail(val: string): boolean {
  return val.includes('@');
}

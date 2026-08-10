import { Request, Response } from 'express';
import { User, IAddress } from '../models/User';
import { OTP } from '../models/OTP';
import { Cart } from '../models/Cart';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { issueTokenPair, clearAuthCookies, REFRESH_COOKIE, verifyRefreshToken, revokeRefreshToken, revokeAllRefreshTokens } from '../utils/jwt';
import { sendWelcomeEmail, sendOTPEmail, sendPasswordResetEmail } from '../services/email.service';
import { sendSMSOTP } from '../services/sms.service';
import { mergeGuestCart } from './cart.controller';
import crypto from 'crypto';
import { env } from '../config/env';
import { isRedisEnabled, redisExists } from '../config/redis';
import { logger } from '../utils/logger';

async function maybeMergeGuestCart(req: Request, userId: string): Promise<void> {
  const sessionId = req.headers['x-guest-session-id'];
  if (typeof sessionId === 'string' && sessionId.trim()) {
    await mergeGuestCart(sessionId.trim(), userId);
  }
}

async function assertNotAdminAccount(email: string): Promise<void> {
  const existing = await User.findOne({ email: email.toLowerCase() }).select('role');
  if (existing?.role === 'admin') {
    throw ApiError.forbidden('Admin accounts must sign in at /admin/login');
  }
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, password } = req.body;
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const phoneRaw = String(req.body.phone || '').trim();
  const phone = /^[6-9]\d{9}$/.test(phoneRaw) ? phoneRaw : undefined;

  const existingUser = await User.findOne({ email });
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
    name: String(name).trim(),
    email,
    ...(phone ? { phone } : {}),
    password,
    role: 'user',
    isVerified: false,
    isBlocked: false,
  });

  void sendWelcomeEmail(user.email, user.name);

  // OTP is best-effort — account must still be created for admin Customers list
  try {
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await (OTP as any).createOTP(user.email, 'register', rawOtp, 15);
    void sendOTPEmail(user.email, rawOtp, 'register');
  } catch (err) {
    logger.warn({ err, email: user.email }, 'Post-register OTP failed');
  }

  await issueTokenPair(res, user._id.toString(), user.role);
  await maybeMergeGuestCart(req, user._id.toString());

  return sendSuccess(
    res,
    user.toJSON(),
    'Registration successful. You can now shop and sign in anytime.',
    201,
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    throw ApiError.notFound('Please register first');
  }

  if (user.role === 'admin') {
    throw ApiError.forbidden('Admin accounts must sign in at /admin/login');
  }

  if (user.isBlocked) {
    throw ApiError.forbidden('Your account has been suspended');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  await issueTokenPair(res, user._id.toString(), user.role);
  await maybeMergeGuestCart(req, user._id.toString());

  return sendSuccess(res, user, 'Login successful');
});

/** Dedicated admin portal login — email + password, role=admin only */
export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  if (!user || user.role !== 'admin') {
    throw ApiError.unauthorized('Invalid admin credentials');
  }

  if (user.isBlocked) {
    throw ApiError.forbidden('This admin account has been suspended');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid admin credentials');
  }

  await issueTokenPair(res, user._id.toString(), user.role);
  return sendSuccess(res, user, 'Admin login successful');
});

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

  if (isRedisEnabled()) {
    const redisKey = `rt:${userId}:${tokenId}`;
    const exists = await redisExists(redisKey);

    if (!exists) {
      await revokeAllRefreshTokens(userId);
      clearAuthCookies(res);
      throw ApiError.unauthorized('Token reuse detected, please log in again');
    }

    await revokeRefreshToken(userId, tokenId);
  }

  const user = await User.findById(userId).select('_id role isBlocked');
  if (!user || user.isBlocked) {
    clearAuthCookies(res);
    throw ApiError.forbidden('User not found or suspended');
  }

  await issueTokenPair(res, user._id.toString(), user.role);

  return sendSuccess(res, { role: user.role }, 'Token refreshed successfully');
});

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

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, type, phone } = req.body;
  const normalizedId = String(identifier).trim().toLowerCase();
  const isEmailValue = normalizedId.includes('@');

  if (isEmailValue) {
    await assertNotAdminAccount(normalizedId);
  }

  const mobile =
    typeof phone === 'string' && /^[6-9]\d{9}$/.test(phone)
      ? phone
      : !isEmailValue && /^[6-9]\d{9}$/.test(normalizedId)
        ? normalizedId
        : undefined;

  // Login OTP only for existing customer accounts — no silent account creation
  if (type === 'login') {
    const user = isEmailValue
      ? await User.findOne({ email: normalizedId })
      : await User.findOne({ phone: mobile || normalizedId });

    if (!user) {
      throw ApiError.notFound('Please register first');
    }
    if (user.role === 'admin') {
      throw ApiError.forbidden('Admin accounts must sign in at /admin/login');
    }
    if (user.isBlocked) {
      throw ApiError.forbidden('Your account has been suspended');
    }
  }

  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  await (OTP as any).createOTP(normalizedId, type, rawOtp, 15);

  const delivered: boolean[] = [];
  try {
    if (isEmailValue) {
      delivered.push(await sendOTPEmail(normalizedId, rawOtp, type));
    }
    if (mobile) {
      delivered.push(await sendSMSOTP(mobile, rawOtp));
    }
  } catch (err) {
    logger.warn({ err, identifier: normalizedId }, 'OTP delivery error');
  }

  if (!delivered.some(Boolean)) {
    throw ApiError.internal('Failed to send OTP. Please try again in a moment.');
  }

  return sendSuccess(
    res,
    { phone: mobile },
    isEmailValue && mobile
      ? 'OTP sent to your email and mobile'
      : isEmailValue
        ? 'OTP sent to your email'
        : 'OTP sent to your mobile',
  );
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, type, phone } = req.body;
  const code = String(req.body.code ?? '').trim();

  const otpRecord = await OTP.findOne({ identifier: identifier.toLowerCase(), type }).select(
    '+hashedCode',
  );

  if (!otpRecord) {
    throw ApiError.badRequest('OTP expired or not found. Please request a new one.');
  }

  if (otpRecord.expiresAt < new Date()) {
    await otpRecord.deleteOne();
    throw ApiError.badRequest('OTP has expired. Please request a new one.');
  }

  if (otpRecord.attempts >= 5) {
    await otpRecord.deleteOne();
    throw ApiError.tooMany('Too many incorrect attempts, please request a new OTP');
  }

  const isValid = await otpRecord.compare(code);
  if (!isValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw ApiError.badRequest('Invalid OTP. Please try again.');
  }

  await otpRecord.deleteOne();

  if (type === 'login' || type === 'register') {
    const user = await User.findOne(
      isEmail(identifier) ? { email: identifier.toLowerCase() } : { phone: identifier },
    );

    if (user?.role === 'admin') {
      throw ApiError.forbidden('Admin accounts must sign in at /admin/login');
    }

    if (!user) {
      throw ApiError.notFound('Please register first');
    }

    if (user.isBlocked) {
      throw ApiError.forbidden('Your account has been suspended');
    }

    let dirty = false;
    if (!user.isVerified) {
      user.isVerified = true;
      dirty = true;
    }
    if (
      typeof phone === 'string' &&
      /^[6-9]\d{9}$/.test(phone) &&
      user.phone !== phone
    ) {
      const phoneTaken = await User.findOne({ phone, _id: { $ne: user._id } });
      if (!phoneTaken) {
        user.phone = phone;
        dirty = true;
      }
    }
    if (dirty) await user.save();

    await issueTokenPair(res, user._id.toString(), user.role);
    await maybeMergeGuestCart(req, user._id.toString());
    return sendSuccess(res, user, 'OTP verified successfully');
  }

  if (type === 'phone-verify') {
    if (!req.user) {
      throw ApiError.unauthorized('Login required to verify phone');
    }
    const user = await User.findById(req.user._id);
    if (!user) throw ApiError.notFound('User not found');
    user.isVerified = true;
    if (!isEmail(identifier)) user.phone = identifier;
    await user.save();
    return sendSuccess(res, user, 'Phone verified successfully');
  }

  return sendSuccess(res, null, 'OTP verified successfully');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return sendSuccess(res, null, 'If this email is registered, a password reset link has been sent');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await OTP.findOneAndUpdate(
    { identifier: email.toLowerCase(), type: 'reset-password' },
    { hashedCode: hashedToken, expiresAt, attempts: 0 },
    { upsert: true }
  );

  const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}?email=${encodeURIComponent(email)}`;
  void sendPasswordResetEmail(email, resetUrl);

  return sendSuccess(res, null, 'Password reset link sent');
});

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
  }).select('+hashedCode');

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

  user.password = password;
  await user.save();
  await otpRecord.deleteOne();
  await revokeAllRefreshTokens(user._id.toString());

  return sendSuccess(res, null, 'Password reset successful. Please login with your new password.');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw ApiError.unauthorized();
  }
  if (user.isBlocked) {
    throw ApiError.forbidden('Your account has been blocked. Please contact support.');
  }
  return sendSuccess(res, user);
});

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

/** Permanently delete the logged-in customer's account and related cart data */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound('User not found');

  if (user.role === 'admin') {
    throw ApiError.forbidden('Admin accounts cannot be deleted from the storefront');
  }

  const userId = user._id.toString();

  // Revoke sessions + clear cookies
  await revokeAllRefreshTokens(userId);
  clearAuthCookies(res);

  // Remove cart tied to this user
  try {
    await Cart.deleteMany({ userId: user._id });
  } catch {
    // ignore if cart cleanup fails
  }

  // Drop OTPs for this email
  try {
    await OTP.deleteMany({ identifier: user.email });
  } catch {
    // ignore
  }

  await user.deleteOne();

  return sendSuccess(res, null, 'Account deleted successfully');
});

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const addressData = req.body as IAddress;
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound();

  if (addressData.isDefault) {
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
  user.addresses.splice(addressIndex, 1);

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  return sendSuccess(res, user.addresses, 'Address deleted successfully');
});

function isEmail(val: string): boolean {
  return val.includes('@');
}

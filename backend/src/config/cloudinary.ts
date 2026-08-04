import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { env } from './env';
import { logger } from '../utils/logger';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** True only when real Cloudinary credentials are configured (not placeholders). */
export function isCloudinaryConfigured(): boolean {
  const key = env.CLOUDINARY_API_KEY || '';
  const secret = env.CLOUDINARY_API_SECRET || '';
  const name = env.CLOUDINARY_CLOUD_NAME || '';
  const bad = /^(your_|changeme|xxx|placeholder|todo)/i;
  if (!key || !secret || !name) return false;
  if (bad.test(key) || bad.test(secret) || bad.test(name)) return false;
  if (key === 'your_api_key') return false;
  return true;
}

const CLOUDINARY_OK = isCloudinaryConfigured();
if (!CLOUDINARY_OK) {
  logger.warn(
    'Cloudinary credentials are missing/placeholders — category images will be stored locally in /uploads',
  );
}

// ── Multer storage for product images ─────────────────────────────
const productStorage = CLOUDINARY_OK
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `${env.CLOUDINARY_FOLDER}/products`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
        ],
      } as object,
    })
  : multer.diskStorage({
      destination: (_req, _file, cb) => {
        const dir = path.join(process.cwd(), 'uploads', 'products');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
      },
    });

// ── Multer storage for avatars ────────────────────────────────────
const avatarStorage = CLOUDINARY_OK
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `${env.CLOUDINARY_FOLDER}/avatars`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto' },
        ],
      } as object,
    })
  : multer.diskStorage({
      destination: (_req, _file, cb) => {
        const dir = path.join(process.cwd(), 'uploads', 'avatars');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `avatar-${Date.now()}${ext}`);
      },
    });

const categoryStorage = CLOUDINARY_OK
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `${env.CLOUDINARY_FOLDER}/categories`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          { width: 1200, height: 900, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
        ],
      } as object,
    })
  : multer.diskStorage({
      destination: (_req, _file, cb) => {
        const dir = path.join(process.cwd(), 'uploads', 'categories');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
      },
    });

function imageFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (/^image\//i.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
}

export const uploadProductImages = multer({
  storage: productStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});

export const uploadCategoryImage = multer({
  storage: categoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

/**
 * Normalize multer file (Cloudinary or local disk) into a public URL + optional publicId.
 */
export function resolveUploadedImage(
  file: Express.Multer.File | undefined,
  kind: 'categories' | 'products' | 'avatars' = 'categories',
): { url: string; publicId: string } | null {
  if (!file) return null;

  const anyFile = file as Express.Multer.File & {
    path?: string;
    filename?: string;
    public_id?: string;
    secure_url?: string;
  };

  // Cloudinary storage sets path to the hosted URL
  if (anyFile.path && /^https?:\/\//i.test(anyFile.path)) {
    return {
      url: anyFile.path,
      publicId: anyFile.filename || anyFile.public_id || '',
    };
  }
  if (anyFile.secure_url) {
    return {
      url: anyFile.secure_url,
      publicId: anyFile.public_id || anyFile.filename || '',
    };
  }

  // Local disk fallback
  const filename = anyFile.filename || path.basename(anyFile.path || '');
  if (!filename) return null;
  return {
    url: `/uploads/${kind}/${filename}`,
    publicId: '',
  };
}

export async function deleteCloudinaryAsset(publicId: string): Promise<void> {
  if (!publicId || !CLOUDINARY_OK) return;
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };

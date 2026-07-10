import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { env } from './env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ── Multer storage for product images ─────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: `${env.CLOUDINARY_FOLDER}/products`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
    ],
  } as object,
});

// ── Multer storage for avatars ────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: `${env.CLOUDINARY_FOLDER}/avatars`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto' },
    ],
  } as object,
});

// File filter — images only
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
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB, max 5 files
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});

// Delete a Cloudinary asset by public_id
export async function deleteCloudinaryAsset(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };

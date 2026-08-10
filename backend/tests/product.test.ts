import request from 'supertest';
import * as XLSX from 'xlsx';
import app from '../src/app';
import { Product } from '../src/models/Product';
import { Category } from '../src/models/Category';
import { User } from '../src/models/User';
import { deleteCloudinaryAsset, resolveUploadedImage } from '../src/config/cloudinary';
import { signAccessToken } from '../src/utils/jwt';

jest.mock('../src/models/Product');
jest.mock('../src/models/Category');
jest.mock('../src/models/User');

// Real CloudinaryStorage would attempt a live network call using the fake
// test credentials in tests/setup.ts — swap in memory storage + a mock
// resolver so `.attach()`'d files never leave the process.
jest.mock('../src/config/cloudinary', () => {
  const multer = jest.requireActual('multer');
  const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 5 } });
  return {
    uploadProductImages: memoryUpload,
    uploadCategoryImage: memoryUpload,
    uploadAvatar: memoryUpload,
    deleteCloudinaryAsset: jest.fn().mockResolvedValue(undefined),
    resolveUploadedImage: jest.fn((file: any, kind: string) =>
      file ? { url: `/uploads/${kind}/mock-${file.originalname}`, publicId: `mock-pid-${file.originalname}` } : null,
    ),
    cloudinary: {},
  };
});

describe('Product API Endpoints', () => {
  const adminId = '507f1f77bcf86cd799439011';
  const adminToken = signAccessToken(adminId, 'admin');
  const productId = '507f1f77bcf86cd799439021';

  const mockAuthAdmin = () => {
    (User.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ _id: adminId, role: 'admin', isBlocked: false }),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // resetMocks wipes these implementations before every test.
    (deleteCloudinaryAsset as jest.Mock).mockResolvedValue(undefined);
    (resolveUploadedImage as jest.Mock).mockImplementation((file: any, kind: string) =>
      file ? { url: `/uploads/${kind}/mock-${file.originalname}`, publicId: `mock-pid-${file.originalname}` } : null,
    );
  });

  describe('GET /api/products', () => {
    it('should fetch list of active products with pagination meta', async () => {
      const mockProducts = [
        {
          _id: '507f1f77bcf86cd799439021',
          name: 'Turmeric Powder',
          slug: 'turmeric-powder',
          category: 'ground-spices',
          isActive: true,
          weights: [{ weight: '250g', price: 90, mrp: 100, stock: 100 }],
        },
      ];

      (Product.countDocuments as jest.Mock).mockResolvedValue(1);
      (Product.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockProducts),
        }),
      });

      const res = await request(app).get('/api/products?page=1&limit=12');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Turmeric Powder');
      expect(res.body.meta).toEqual({
        page: 1,
        limit: 12,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('GET /api/products/:slug', () => {
    it('should fetch product details for a valid slug', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439021',
        name: 'Turmeric Powder',
        slug: 'turmeric-powder',
        category: 'ground-spices',
        isActive: true,
        weights: [{ weight: '250g', price: 90, mrp: 100, stock: 100 }],
      };

      (Product.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProduct),
      });

      const res = await request(app).get('/api/products/turmeric-powder');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('turmeric-powder');
    });

    it('should return 404 if product slug is missing or inactive', async () => {
      (Product.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get('/api/products/invalid-slug');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/products/:id — image management', () => {
    it('should remove a selected image, keep the rest, and only delete the Cloudinary asset for the removed one', async () => {
      mockAuthAdmin();
      const originalProduct = {
        _id: productId,
        slug: 'masala-hing',
        images: ['/uploads/products/img1.jpg', '/uploads/products/img2.jpg'],
        imagePublicIds: ['pid1', ''], // img2 was a local-disk fallback upload — no Cloudinary asset
        toObject: function () {
          return this;
        },
      };
      (Product.findById as jest.Mock).mockResolvedValue(originalProduct);
      (Product.findByIdAndUpdate as jest.Mock).mockImplementation((_id, data) => ({
        ...originalProduct,
        ...data,
        toObject: function () {
          return this;
        },
      }));

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Cookie', [`access_token=${adminToken}`])
        .field('removeImages', JSON.stringify(['/uploads/products/img1.jpg']));

      expect(res.statusCode).toBe(200);
      expect(deleteCloudinaryAsset).toHaveBeenCalledTimes(1);
      expect(deleteCloudinaryAsset).toHaveBeenCalledWith('pid1');
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        expect.objectContaining({
          images: ['/uploads/products/img2.jpg'],
          imagePublicIds: [''],
        }),
        expect.anything(),
      );
    });

    it('should append newly uploaded images to the existing gallery', async () => {
      mockAuthAdmin();
      const originalProduct = {
        _id: productId,
        slug: 'masala-hing',
        images: ['/uploads/products/existing.jpg'],
        imagePublicIds: ['pid-existing'],
        toObject: function () {
          return this;
        },
      };
      (Product.findById as jest.Mock).mockResolvedValue(originalProduct);
      (Product.findByIdAndUpdate as jest.Mock).mockImplementation((_id, data) => ({
        ...originalProduct,
        ...data,
        toObject: function () {
          return this;
        },
      }));

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Cookie', [`access_token=${adminToken}`])
        .attach('images', Buffer.from('fake-image-bytes'), 'new.jpg');

      expect(res.statusCode).toBe(200);
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        expect.objectContaining({
          images: ['/uploads/products/existing.jpg', '/uploads/products/mock-new.jpg'],
          imagePublicIds: ['pid-existing', 'mock-pid-new.jpg'],
        }),
        expect.anything(),
      );
    });

    it('should reject when the total image count would exceed the 5-image cap', async () => {
      mockAuthAdmin();
      const originalProduct = {
        _id: productId,
        slug: 'masala-hing',
        images: Array.from({ length: 5 }, (_, i) => `/uploads/products/img${i}.jpg`),
        imagePublicIds: Array.from({ length: 5 }, (_, i) => `pid${i}`),
        toObject: function () {
          return this;
        },
      };
      (Product.findById as jest.Mock).mockResolvedValue(originalProduct);

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Cookie', [`access_token=${adminToken}`])
        .attach('images', Buffer.from('fake-image-bytes'), 'one-too-many.jpg');

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/at most 5 images/i);
      expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/products/bulk — untrusted image URL handling', () => {
    it('should drop an image URL from an untrusted host and warn, without failing the row', async () => {
      mockAuthAdmin();
      (Category.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ slug: 'ground-spices', isActive: true }]),
      });
      (Product.create as jest.Mock).mockImplementation((data: any) =>
        Promise.resolve({ ...data, slug: 'test-product' }),
      );

      const rows = [
        {
          name: 'Test Product',
          category: 'ground-spices',
          description: 'A test product description here',
          weight: '100g',
          price: 50,
          mrp: 60,
          stock: 10,
          image: 'https://evil.example.com/scraped-photo.jpg',
        },
      ];
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

      const res = await request(app)
        .post('/api/products/bulk')
        .set('Cookie', [`access_token=${adminToken}`])
        .attach('file', buffer, 'import.xlsx');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.createdCount).toBe(1);
      expect(res.body.data.warnings).toHaveLength(1);
      expect(res.body.data.warnings[0].message).toMatch(/untrusted host/i);
      expect(Product.create).toHaveBeenCalledWith(expect.objectContaining({ images: [] }));
    });
  });
});

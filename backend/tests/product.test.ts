import request from 'supertest';
import app from '../src/app';
import { Product } from '../src/models/Product';

jest.mock('../src/models/Product');

describe('Product API Endpoints', () => {
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
});

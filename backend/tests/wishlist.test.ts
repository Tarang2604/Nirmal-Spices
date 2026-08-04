import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { Product } from '../src/models/Product';
import { signAccessToken } from '../src/utils/jwt';

jest.mock('../src/models/User');
jest.mock('../src/models/Product');

describe('Wishlist API Endpoints', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = signAccessToken(userId, 'user');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/wishlist', () => {
    it('should successfully fetch user wishlist', async () => {
      const mockWishlist = [
        { _id: '507f1f77bcf86cd799439021', name: 'Biryani Masala', slug: 'biryani-masala', isActive: true },
      ];

      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({
          _id: userId,
          role: 'user',
          isBlocked: false,
          wishlist: mockWishlist,
        }),
      });

      const res = await request(app)
        .get('/api/wishlist')
        .set('Cookie', [`access_token=${token}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Biryani Masala');
    });
  });

  describe('POST /api/wishlist/toggle', () => {
    it('should add a product to wishlist if not already present', async () => {
      const productId = '507f1f77bcf86cd799439021';
      (Product.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: productId, name: 'Biryani Masala', isActive: true }),
      });

      const mockSave = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: userId,
        role: 'user',
        isBlocked: false,
        wishlist: {
          some: jest.fn().mockReturnValue(false),
          push: jest.fn(),
          filter: jest.fn().mockReturnThis(),
        },
        save: mockSave,
      };

      // Mock verifyAuth user lookup (lean)
      // and controller user lookup (saves, so not lean)
      (User.findById as jest.Mock).mockImplementation(() => {
        // If it's verifyAuth it calls lean()
        // If it's controller it doesn't call lean()
        return {
          select: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue(mockUser),
          save: mockSave,
          wishlist: mockUser.wishlist,
        };
      });

      const res = await request(app)
        .post('/api/wishlist/toggle')
        .set('Cookie', [`access_token=${token}`])
        .send({ productId });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.added).toBe(true);
    });

    it('should remove a product from wishlist if already present', async () => {
      const productId = '507f1f77bcf86cd799439021';
      (Product.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: productId, name: 'Biryani Masala', isActive: true }),
      });

      const mockSave = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: userId,
        role: 'user',
        isBlocked: false,
        wishlist: {
          some: jest.fn().mockReturnValue(true),
          push: jest.fn(),
          filter: jest.fn().mockReturnValue([]),
        },
        save: mockSave,
      };

      (User.findById as jest.Mock).mockImplementation(() => {
        return {
          select: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue(mockUser),
          save: mockSave,
          wishlist: mockUser.wishlist,
        };
      });

      const res = await request(app)
        .post('/api/wishlist/toggle')
        .set('Cookie', [`access_token=${token}`])
        .send({ productId });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.added).toBe(false);
    });
  });

  describe('DELETE /api/wishlist/clear', () => {
    it('should successfully clear user wishlist', async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: userId, role: 'user', isBlocked: false }),
      });
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: userId, wishlist: [] });

      const res = await request(app)
        .delete('/api/wishlist/clear')
        .set('Cookie', [`access_token=${token}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });
});

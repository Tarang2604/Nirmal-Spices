import request from 'supertest';
import app from '../src/app';
import { Review } from '../src/models/Review';
import { Order } from '../src/models/Order';
import { Product } from '../src/models/Product';
import { User } from '../src/models/User';
import { signAccessToken } from '../src/utils/jwt';

jest.mock('../src/models/Review');
jest.mock('../src/models/Order');
jest.mock('../src/models/Product');
jest.mock('../src/models/User');

function mockQuery(resolvedValue: unknown) {
  const query: Record<string, unknown> = {
    select: jest.fn(() => query),
    populate: jest.fn(() => query),
    sort: jest.fn(() => query),
    skip: jest.fn(() => query),
    limit: jest.fn(() => query),
    lean: jest.fn(() => query),
    then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
      Promise.resolve(resolvedValue).then(resolve, reject),
  };
  return query;
}

const userId = '507f1f77bcf86cd799439011';
const productId = '507f1f77bcf86cd799439021';
const reviewId = '507f1f77bcf86cd799439099';

describe('Review API Endpoints', () => {
  const token = signAccessToken(userId, 'user');
  const adminToken = signAccessToken(userId, 'admin');

  const mockAuthUser = (role: 'user' | 'admin') => {
    (User.findById as jest.Mock).mockReturnValue(
      mockQuery({ _id: userId, role, isBlocked: false, isVerified: true }),
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reviews/:productId', () => {
    it('should return approved reviews for a product without requiring auth', async () => {
      (Review.countDocuments as jest.Mock).mockResolvedValue(1);
      (Review.find as jest.Mock).mockReturnValue(
        mockQuery([{ _id: reviewId, rating: 5, title: 'Great', isApproved: true }]),
      );

      const res = await request(app).get(`/api/reviews/${productId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/reviews/:productId', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post(`/api/reviews/${productId}`)
        .send({ rating: 5, title: 'Nice', body: 'Great product' });

      expect(res.statusCode).toBe(401);
    });

    it('should reject reviewing a product that does not exist', async () => {
      mockAuthUser('user');
      (Product.findById as jest.Mock).mockResolvedValue(null);
      (Review.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/reviews/${productId}`)
        .set('Cookie', [`access_token=${token}`])
        .send({ rating: 5, title: 'Nice', body: 'Great product' });

      expect(res.statusCode).toBe(404);
    });

    it('should reject a duplicate review from the same user', async () => {
      mockAuthUser('user');
      (Product.findById as jest.Mock).mockResolvedValue({ _id: productId });
      (Review.findOne as jest.Mock).mockResolvedValue({ _id: 'existing-review' });

      const res = await request(app)
        .post(`/api/reviews/${productId}`)
        .set('Cookie', [`access_token=${token}`])
        .send({ rating: 5, title: 'Nice', body: 'Great product' });

      expect(res.statusCode).toBe(409);
    });

    it('should mark the review as a verified purchase when a delivered order exists', async () => {
      mockAuthUser('user');
      (Product.findById as jest.Mock).mockResolvedValue({ _id: productId });
      (Review.findOne as jest.Mock).mockResolvedValue(null);
      (Order.findOne as jest.Mock).mockResolvedValue({ _id: 'order-1' });
      (Review.create as jest.Mock).mockResolvedValue({
        _id: reviewId,
        isVerifiedPurchase: true,
        isApproved: false,
      });

      const res = await request(app)
        .post(`/api/reviews/${productId}`)
        .set('Cookie', [`access_token=${token}`])
        .send({ rating: 5, title: 'Nice', body: 'Great product' });

      expect(res.statusCode).toBe(201);
      expect(Review.create).toHaveBeenCalledWith(
        expect.objectContaining({ isVerifiedPurchase: true, isApproved: false }),
      );
    });
  });

  describe('PUT /api/reviews/:id/approve', () => {
    it('should reject approval from a non-admin user', async () => {
      mockAuthUser('user');

      const res = await request(app)
        .put(`/api/reviews/${reviewId}/approve`)
        .set('Cookie', [`access_token=${token}`]);

      expect(res.statusCode).toBe(403);
    });

    it('should let an admin approve a review and refresh product rating', async () => {
      mockAuthUser('admin');
      const mockReview = {
        _id: reviewId,
        product: productId,
        isApproved: false,
        save: jest.fn().mockResolvedValue(true),
      };
      (Review.findById as jest.Mock).mockResolvedValue(mockReview);
      (Review.aggregate as jest.Mock).mockResolvedValue([{ _id: productId, avgRating: 4.5, count: 3 }]);
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);
      (Product.findById as jest.Mock).mockReturnValue(mockQuery(null));

      const res = await request(app)
        .put(`/api/reviews/${reviewId}/approve`)
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      expect(mockReview.isApproved).toBe(true);
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        expect.objectContaining({ rating: 4.5, reviewCount: 3 }),
      );
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    it('should reject deletion by a user who does not own the review', async () => {
      mockAuthUser('user');
      (Review.findById as jest.Mock).mockResolvedValue({
        _id: reviewId,
        user: { toString: () => 'someone-else' },
      });

      const res = await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .set('Cookie', [`access_token=${token}`]);

      expect(res.statusCode).toBe(403);
    });

    it('should allow the owner to delete their own review', async () => {
      mockAuthUser('user');
      const mockReview = {
        _id: reviewId,
        product: productId,
        user: { toString: () => userId },
        toObject: function () {
          return this;
        },
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      (Review.findById as jest.Mock).mockResolvedValue(mockReview);
      (Review.aggregate as jest.Mock).mockResolvedValue([]);
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);
      (Product.findById as jest.Mock).mockReturnValue(mockQuery(null));

      const res = await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .set('Cookie', [`access_token=${token}`]);

      expect(res.statusCode).toBe(200);
      expect(mockReview.deleteOne).toHaveBeenCalled();
    });
  });
});

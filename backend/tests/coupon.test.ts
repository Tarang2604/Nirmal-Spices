import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { Coupon } from '../src/models/Coupon';
import { signAccessToken } from '../src/utils/jwt';

jest.mock('../src/models/User');
// Keep the real `calculateCouponDiscount` pure function; only mock the Mongoose model.
jest.mock('../src/models/Coupon', () => {
  const actual = jest.requireActual('../src/models/Coupon');
  return {
    ...actual,
    Coupon: {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    },
  };
});

function mockQuery(resolvedValue: unknown) {
  const query: Record<string, unknown> = {
    select: jest.fn(() => query),
    sort: jest.fn(() => query),
    lean: jest.fn(() => query),
    then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
      Promise.resolve(resolvedValue).then(resolve, reject),
  };
  return query;
}

describe('Coupon API Endpoints', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = signAccessToken(userId, 'user');
  const adminToken = signAccessToken(userId, 'admin');

  const mockAuthUser = (role: 'user' | 'admin') => {
    // Backs both verifyAuth's `.select(...).lean()` chain and
    // validateCoupon's bare `.select('isVerified')` chain — both must resolve.
    (User.findById as jest.Mock).mockReturnValue(
      mockQuery({ _id: userId, role, isBlocked: false, isVerified: true }),
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/coupons/available', () => {
    it('should return active coupons without requiring auth', async () => {
      (Coupon.find as jest.Mock).mockReturnValue(
        mockQuery([{ code: 'WELCOME10', type: 'percent', value: 10 }]),
      );

      const res = await request(app).get('/api/coupons/available');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/coupons/validate', () => {
    it('should reject when not authenticated', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'SAVE10', cartAmount: 500 });

      expect(res.statusCode).toBe(401);
    });

    it('should reject an unknown coupon code', async () => {
      mockAuthUser('user');
      (Coupon.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Cookie', [`access_token=${token}`])
        .send({ code: 'DOESNOTEXIST', cartAmount: 500 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid coupon/i);
    });

    it('should reject a coupon that has hit its usage limit', async () => {
      mockAuthUser('user');
      (Coupon.findOne as jest.Mock).mockResolvedValue({
        code: 'SOLDOUT',
        startsAt: new Date(Date.now() - 86400000),
        expiresAt: new Date(Date.now() + 86400000),
        usedCount: 10,
        maxUses: 10,
        minOrder: 0,
        usedBy: [],
        oncePerUser: true,
      });

      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Cookie', [`access_token=${token}`])
        .send({ code: 'SOLDOUT', cartAmount: 500 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/usage limit reached/i);
    });

    it('should reject a coupon already used by this user (oncePerUser)', async () => {
      mockAuthUser('user');
      (Coupon.findOne as jest.Mock).mockResolvedValue({
        code: 'ONETIME',
        startsAt: new Date(Date.now() - 86400000),
        expiresAt: new Date(Date.now() + 86400000),
        usedCount: 1,
        maxUses: 100,
        minOrder: 0,
        usedBy: [userId],
        oncePerUser: true,
      });

      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Cookie', [`access_token=${token}`])
        .send({ code: 'ONETIME', cartAmount: 500 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already used/i);
    });

    it('should compute and cap the discount for a valid coupon', async () => {
      mockAuthUser('user');
      (Coupon.findOne as jest.Mock).mockResolvedValue({
        code: 'SAVE20',
        type: 'percent',
        value: 20,
        maxDiscount: 50,
        startsAt: new Date(Date.now() - 86400000),
        expiresAt: new Date(Date.now() + 86400000),
        usedCount: 0,
        maxUses: 100,
        minOrder: 0,
        usedBy: [],
        oncePerUser: true,
      });

      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Cookie', [`access_token=${token}`])
        .send({ code: 'SAVE20', cartAmount: 500 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      // 20% of 500 = 100, capped at maxDiscount 50
      expect(res.body.data.discount).toBe(50);
    });
  });

  describe('Admin coupon management', () => {
    it('should reject coupon creation from a non-admin user', async () => {
      mockAuthUser('user');

      const res = await request(app)
        .post('/api/coupons')
        .set('Cookie', [`access_token=${token}`])
        .send({
          code: 'ADMINONLY',
          type: 'flat',
          value: 50,
          expiresAt: '2030-01-01',
        });

      expect(res.statusCode).toBe(403);
    });

    it('should let an admin create a coupon', async () => {
      mockAuthUser('admin');
      (Coupon.findOne as jest.Mock).mockResolvedValue(null);
      (Coupon.create as jest.Mock).mockResolvedValue({
        _id: '507f1f77bcf86cd799439099',
        code: 'NEWCODE',
        toObject: function () {
          return this;
        },
      });

      const res = await request(app)
        .post('/api/coupons')
        .set('Cookie', [`access_token=${adminToken}`])
        .send({
          code: 'newcode',
          type: 'flat',
          value: 50,
          expiresAt: '2030-01-01',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(Coupon.create).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'NEWCODE' }),
      );
    });

    it('should reject creating a coupon with a duplicate code', async () => {
      mockAuthUser('admin');
      (Coupon.findOne as jest.Mock).mockResolvedValue({ code: 'DUPLICATE' });

      const res = await request(app)
        .post('/api/coupons')
        .set('Cookie', [`access_token=${adminToken}`])
        .send({
          code: 'duplicate',
          type: 'flat',
          value: 50,
          expiresAt: '2030-01-01',
        });

      expect(res.statusCode).toBe(409);
    });

    it('should let an admin list all coupons', async () => {
      mockAuthUser('admin');
      (Coupon.find as jest.Mock).mockReturnValue(mockQuery([{ code: 'A' }, { code: 'B' }]));

      const res = await request(app)
        .get('/api/coupons')
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('should let an admin delete a coupon', async () => {
      mockAuthUser('admin');
      const mockCoupon = {
        _id: '507f1f77bcf86cd799439099',
        code: 'DELETEME',
        toObject: function () {
          return this;
        },
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      (Coupon.findById as jest.Mock).mockResolvedValue(mockCoupon);

      const res = await request(app)
        .delete('/api/coupons/507f1f77bcf86cd799439099')
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      expect(mockCoupon.deleteOne).toHaveBeenCalled();
    });
  });
});

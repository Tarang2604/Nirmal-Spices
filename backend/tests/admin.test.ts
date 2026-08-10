import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { Order } from '../src/models/Order';
import { signAccessToken } from '../src/utils/jwt';

jest.mock('../src/models/User');
jest.mock('../src/models/Order');

function mockQuery(resolvedValue: unknown) {
  const query: Record<string, unknown> = {
    select: jest.fn(() => query),
    lean: jest.fn(() => query),
    then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
      Promise.resolve(resolvedValue).then(resolve, reject),
  };
  return query;
}

const adminId = '507f1f77bcf86cd799439011';
const targetUserId = '507f1f77bcf86cd799439022';
const orderId = '507f1f77bcf86cd799439033';

describe('Admin API Endpoints', () => {
  const userToken = signAccessToken(adminId, 'user');
  const adminToken = signAccessToken(adminId, 'admin');

  const mockAuthUser = (role: 'user' | 'admin') => {
    (User.findById as jest.Mock).mockReturnValue(
      mockQuery({ _id: adminId, role, isBlocked: false }),
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Route-level admin gating', () => {
    it('should reject a non-admin user from any /api/admin/* route', async () => {
      mockAuthUser('user');

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Cookie', [`access_token=${userToken}`]);

      expect(res.statusCode).toBe(403);
    });

    it('should reject an unauthenticated request', async () => {
      const res = await request(app).get('/api/admin/dashboard');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/admin/users/:id/block', () => {
    it('should refuse to block an administrator account', async () => {
      mockAuthUser('admin');
      // First User.findById call is verifyAuth (admin caller); mock the
      // controller's own lookup for the target on the next call.
      (User.findById as jest.Mock)
        .mockReturnValueOnce(mockQuery({ _id: adminId, role: 'admin', isBlocked: false }))
        .mockResolvedValueOnce({ _id: targetUserId, role: 'admin', isBlocked: false });

      const res = await request(app)
        .put(`/api/admin/users/${targetUserId}/block`)
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/cannot block an administrator/i);
    });

    it('should toggle isBlocked for a regular customer', async () => {
      mockAuthUser('admin');
      const targetUser = {
        _id: targetUserId,
        role: 'user',
        isBlocked: false,
        save: jest.fn().mockResolvedValue(true),
      };
      (User.findById as jest.Mock)
        .mockReturnValueOnce(mockQuery({ _id: adminId, role: 'admin', isBlocked: false }))
        .mockResolvedValueOnce(targetUser);

      const res = await request(app)
        .put(`/api/admin/users/${targetUserId}/block`)
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      expect(targetUser.isBlocked).toBe(true);
      expect(targetUser.save).toHaveBeenCalled();
      expect(res.body.message).toMatch(/blocked/i);
    });
  });

  describe('PUT /api/admin/orders/:id/status', () => {
    it('should reject an invalid status transition', async () => {
      mockAuthUser('admin');
      (User.findById as jest.Mock).mockReturnValue(
        mockQuery({ _id: adminId, role: 'admin', isBlocked: false }),
      );
      (Order.findById as jest.Mock).mockResolvedValue({
        _id: orderId,
        status: 'delivered', // terminal-ish: only 'refunded' is a valid next status
        timeline: [],
      });

      const res = await request(app)
        .put(`/api/admin/orders/${orderId}/status`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send({ status: 'pending' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/cannot transition/i);
    });

    it('should apply a valid status transition and push a timeline entry', async () => {
      mockAuthUser('admin');
      (User.findById as jest.Mock).mockReturnValue(
        mockQuery({ _id: adminId, role: 'admin', isBlocked: false }),
      );
      const mockOrder = {
        _id: orderId,
        status: 'confirmed',
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        guestEmail: 'guest@example.com',
        timeline: [],
        save: jest.fn().mockResolvedValue(true),
      };
      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      const res = await request(app)
        .put(`/api/admin/orders/${orderId}/status`)
        .set('Cookie', [`access_token=${adminToken}`])
        .send({ status: 'processing' });

      expect(res.statusCode).toBe(200);
      expect(mockOrder.status).toBe('processing');
      expect(mockOrder.timeline).toHaveLength(1);
      expect(mockOrder.save).toHaveBeenCalled();
    });
  });
});

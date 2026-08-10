import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { Order } from '../src/models/Order';
import { Product } from '../src/models/Product';
import * as storeSettings from '../src/models/StoreSettings';
import { razorpay } from '../src/config/razorpay';
import { env } from '../src/config/env';
import { signAccessToken } from '../src/utils/jwt';

jest.mock('../src/models/User');
jest.mock('../src/models/Order');
jest.mock('../src/models/Cart');
jest.mock('../src/models/Product');
jest.mock('../src/models/StoreSettings');

describe('Order API Endpoints', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = signAccessToken(userId, 'user');
  const adminToken = signAccessToken(userId, 'admin');

  beforeEach(() => {
    jest.clearAllMocks();

    // jest.config's resetMocks/restoreMocks wipe implementations before every
    // test, so mockResolvedValue/mockReturnValue must be (re)configured here.
    (storeSettings.getOrCreateStoreSettings as jest.Mock).mockResolvedValue({
      commissionType: 'percent',
      commissionValue: 5,
      platformFeeType: 'flat',
      platformFeeValue: 10,
      deliveryCharge: 40,
      freeDeliveryMin: 499,
    });
    (storeSettings.calculateDeliveryCharge as jest.Mock).mockReturnValue(40);
    (storeSettings.calculateFeeAmount as jest.Mock).mockReturnValue(5);
    (razorpay.orders.create as jest.Mock).mockResolvedValue({ id: 'order_test_id' });
  });

  describe('POST /api/orders/create', () => {
    it('should successfully place a Razorpay order (COD is no longer supported)', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439021',
        name: 'Turmeric Powder',
        price: 90,
        inStock: true,
        isActive: true,
        images: ['turmeric.jpg'],
        weights: [{ weight: '250g', price: 90, mrp: 100, stock: 100, sku: 'TURM-250' }],
        save: jest.fn().mockResolvedValue(true),
      };

      (Product.findById as jest.Mock).mockReturnValue({
        session: jest.fn().mockResolvedValue(mockProduct),
      });

      const mockOrder = {
        _id: '507f1f77bcf86cd799439031',
        user: userId,
        items: [{ product: mockProduct._id, weight: '250g', qty: 1, price: 90 }],
        total: 145,
        status: 'pending',
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        timeline: [],
        save: jest.fn().mockResolvedValue(true),
      };

      (Order.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });
      (Order.create as jest.Mock).mockImplementation(() => [mockOrder]);

      // Mock verifyAuth/optionalAuth user lookup
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({
          _id: userId,
          role: 'user',
          isBlocked: false,
        }),
      });

      const res = await request(app)
        .post('/api/orders/create')
        .set('Cookie', [`access_token=${token}`])
        .send({
          items: [{ product: mockProduct._id, weight: '250g', qty: 1 }],
          address: {
            label: 'home',
            fullName: 'John Doe',
            phone: '9876543210',
            line1: 'Street 1',
            city: 'Harda',
            state: 'Madhya Pradesh',
            pincode: '461228',
          },
          paymentMethod: 'razorpay',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentMethod).toBe('razorpay');
      expect(res.body.data.razorpayOrderId).toBeDefined();
    });

    it('should reject a COD payment method (validation)', async () => {
      const res = await request(app)
        .post('/api/orders/create')
        .send({
          items: [{ product: '507f1f77bcf86cd799439021', weight: '250g', qty: 1 }],
          address: {
            label: 'home',
            fullName: 'John Doe',
            phone: '9876543210',
            line1: 'Street 1',
            city: 'Harda',
            state: 'Madhya Pradesh',
            pincode: '461228',
          },
          paymentMethod: 'cod',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should skip the live Razorpay call and fabricate an order id in PAYMENT_TEST_MODE', async () => {
      const originalTestMode = env.PAYMENT_TEST_MODE;
      (env as any).PAYMENT_TEST_MODE = true;

      try {
        const mockProduct = {
          _id: '507f1f77bcf86cd799439021',
          name: 'Turmeric Powder',
          isActive: true,
          images: ['turmeric.jpg'],
          weights: [{ weight: '250g', price: 90, stock: 100, sku: 'TURM-250' }],
          save: jest.fn().mockResolvedValue(true),
        };
        (Product.findById as jest.Mock).mockReturnValue({ session: jest.fn().mockResolvedValue(mockProduct) });
        (Order.findOne as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        (Order.create as jest.Mock).mockImplementation(() => [
          { _id: '507f1f77bcf86cd799439031', timeline: [], save: jest.fn().mockResolvedValue(true) },
        ]);
        (User.findById as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue({ _id: userId, role: 'user', isBlocked: false }),
        });

        const res = await request(app)
          .post('/api/orders/create')
          .set('Cookie', [`access_token=${token}`])
          .send({
            items: [{ product: mockProduct._id, weight: '250g', qty: 1 }],
            address: {
              label: 'home',
              fullName: 'John Doe',
              phone: '9876543210',
              line1: 'Street 1',
              city: 'Harda',
              state: 'Madhya Pradesh',
              pincode: '461228',
            },
            paymentMethod: 'razorpay',
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.testMode).toBe(true);
        expect(res.body.data.razorpayOrderId).toMatch(/^test_/);
        expect(razorpay.orders.create).not.toHaveBeenCalled();
      } finally {
        (env as any).PAYMENT_TEST_MODE = originalTestMode;
      }
    });
  });

  describe('PUT /api/orders/:id/mark-paid-test', () => {
    const orderId = '507f1f77bcf86cd799439031';

    it('should be forbidden when PAYMENT_TEST_MODE is disabled', async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: userId, role: 'admin', isBlocked: false }),
      });

      const res = await request(app)
        .put(`/api/orders/${orderId}/mark-paid-test`)
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(res.statusCode).toBe(403);
    });

    it('should reject a non-admin even in test mode', async () => {
      const originalTestMode = env.PAYMENT_TEST_MODE;
      (env as any).PAYMENT_TEST_MODE = true;
      try {
        (User.findById as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue({ _id: userId, role: 'user', isBlocked: false }),
        });

        const res = await request(app)
          .put(`/api/orders/${orderId}/mark-paid-test`)
          .set('Cookie', [`access_token=${token}`]);

        expect(res.statusCode).toBe(403);
      } finally {
        (env as any).PAYMENT_TEST_MODE = originalTestMode;
      }
    });

    it('should mark a pending order as paid/confirmed when test mode is enabled', async () => {
      const originalTestMode = env.PAYMENT_TEST_MODE;
      (env as any).PAYMENT_TEST_MODE = true;
      try {
        (User.findById as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue({ _id: userId, role: 'admin', isBlocked: false }),
        });
        const mockOrder = {
          _id: orderId,
          paymentMethod: 'razorpay',
          paymentStatus: 'pending',
          status: 'pending',
          guestEmail: 'guest@example.com',
          items: [{ product: '507f1f77bcf86cd799439021', name: 'Turmeric', weight: '250g', qty: 1, price: 90 }],
          subtotal: 90,
          shipping: 0,
          discount: 0,
          total: 90,
          address: { fullName: 'John Doe', line1: 'Street 1', city: 'Harda', state: 'MP', pincode: '461228' },
          timeline: [{ status: 'pending', note: 'Order created — awaiting Razorpay payment' }],
          save: jest.fn().mockResolvedValue(true),
        };
        (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

        const res = await request(app)
          .put(`/api/orders/${orderId}/mark-paid-test`)
          .set('Cookie', [`access_token=${adminToken}`]);

        expect(res.statusCode).toBe(200);
        expect(mockOrder.status).toBe('confirmed');
        expect(mockOrder.paymentStatus).toBe('paid');
      } finally {
        (env as any).PAYMENT_TEST_MODE = originalTestMode;
      }
    });
  });

  describe('GET /api/orders/:id (guest access)', () => {
    it('should successfully fetch a guest order with matching email', async () => {
      const orderId = '507f1f77bcf86cd799439031';
      const mockOrder = {
        _id: orderId,
        user: undefined,
        guestEmail: 'guest@example.com',
        paymentMethod: 'razorpay',
        status: 'pending',
      };

      (Order.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockOrder),
      });

      const res = await request(app).get(`/api/orders/${orderId}?email=guest@example.com`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(orderId);
    });

    it('should NOT leak a guest order to a request with a non-matching email (IDOR regression)', async () => {
      const orderId = '507f1f77bcf86cd799439031';
      const mockOrder = {
        _id: orderId,
        user: undefined,
        guestEmail: 'someone-else@example.com',
        paymentMethod: 'razorpay',
        status: 'pending',
      };

      (Order.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockOrder),
      });

      // No auth cookie + wrong email — previously this passed because
      // `order.user?.toString() === req.user?._id` was `undefined === undefined` (true)
      // whenever a guest order was viewed by an unauthenticated request.
      const res = await request(app).get(`/api/orders/${orderId}?email=attacker@example.com`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/admin/all', () => {
    it('should allow admin to retrieve all orders', async () => {
      const mockOrders = [
        { _id: '507f1f77bcf86cd799439031', total: 110, status: 'pending' },
      ];

      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({
          _id: userId,
          role: 'admin',
          isBlocked: false,
        }),
      });

      (Order.countDocuments as jest.Mock).mockResolvedValue(1);
      (Order.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockOrders),
        }),
      });

      const res = await request(app)
        .get('/api/orders/admin/all')
        .set('Cookie', [`access_token=${adminToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });
});

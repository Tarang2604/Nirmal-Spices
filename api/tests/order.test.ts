import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { Order } from '../src/models/Order';
import { Cart } from '../src/models/Cart';
import { Product } from '../src/models/Product';
import { signAccessToken } from '../src/utils/jwt';

jest.mock('../src/models/User');
jest.mock('../src/models/Order');
jest.mock('../src/models/Cart');
jest.mock('../src/models/Product');

describe('Order API Endpoints', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = signAccessToken(userId, 'user');
  const adminToken = signAccessToken(userId, 'admin');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/orders/create', () => {
    it('should successfully place a COD order', async () => {
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
        total: 110,
        status: 'pending',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };

      (Order.create as jest.Mock).mockImplementation(() => [mockOrder]);
      (Cart.findOneAndDelete as jest.Mock).mockResolvedValue(true);

      // Mock verifyAuth user lookup
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
          paymentMethod: 'cod',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentMethod).toBe('cod');
    });
  });

  describe('GET /api/orders/guest/:id', () => {
    it('should successfully fetch guest order with matching email', async () => {
      const orderId = '507f1f77bcf86cd799439031';
      const mockOrder = {
        _id: orderId,
        guestEmail: 'guest@example.com',
        paymentMethod: 'cod',
        status: 'pending',
      };

      (Order.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockOrder),
      });

      const res = await request(app)
        .get(`/api/orders/guest/${orderId}?email=guest@example.com`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(orderId);
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

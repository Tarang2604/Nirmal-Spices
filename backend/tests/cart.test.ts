import request from 'supertest';
import app from '../src/app';
import { Cart } from '../src/models/Cart';
import { Product } from '../src/models/Product';

jest.mock('../src/models/Product');

// `new Cart(...)` needs to behave like a real document (items array + save()),
// which a plain jest automock of a Mongoose model class does not provide.
jest.mock('../src/models/Cart', () => {
  const CartMock: any = jest.fn();
  CartMock.findOne = jest.fn();
  CartMock.findById = jest.fn();
  CartMock.findOneAndDelete = jest.fn();
  return { Cart: CartMock };
});

function mockQuery(resolvedValue: unknown) {
  const query: Record<string, unknown> = {
    populate: jest.fn(() => query),
    then: (resolve: (v: unknown) => void, reject?: (e: unknown) => void) =>
      Promise.resolve(resolvedValue).then(resolve, reject),
  };
  return query;
}

const GUEST_SESSION_ID = 'guest-session-123';
const PRODUCT_ID = '507f1f77bcf86cd799439021';

describe('Cart API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // resetMocks wipes this constructor implementation before every test.
    (Cart as unknown as jest.Mock).mockImplementation((data: any) => ({
      ...data,
      save: jest.fn().mockResolvedValue(true),
    }));
  });

  describe('GET /api/cart', () => {
    it('should require auth or a guest session id', async () => {
      const res = await request(app).get('/api/cart');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return an empty cart shape when no cart exists yet', async () => {
      (Cart.findOne as jest.Mock).mockReturnValue(mockQuery(null));

      const res = await request(app)
        .get('/api/cart')
        .set('x-guest-session-id', GUEST_SESSION_ID);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items).toEqual([]);
    });

    it('should filter out items whose product is no longer active', async () => {
      const save = jest.fn().mockResolvedValue(true);
      const cart = {
        items: [
          { product: { _id: PRODUCT_ID, isActive: true }, weight: '250g', qty: 2 },
          { product: { _id: 'inactive-product', isActive: false }, weight: '100g', qty: 1 },
        ],
        save,
      };
      (Cart.findOne as jest.Mock).mockReturnValue(mockQuery(cart));

      const res = await request(app)
        .get('/api/cart')
        .set('x-guest-session-id', GUEST_SESSION_ID);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(save).toHaveBeenCalled();
    });
  });

  describe('POST /api/cart/add', () => {
    it('should reject a malformed payload (missing weight/qty)', async () => {
      const res = await request(app)
        .post('/api/cart/add')
        .set('x-guest-session-id', GUEST_SESSION_ID)
        .send({ product: PRODUCT_ID });

      expect(res.statusCode).toBe(400);
    });

    it('should reject adding a product that does not exist', async () => {
      (Product.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/cart/add')
        .set('x-guest-session-id', GUEST_SESSION_ID)
        .send({ product: PRODUCT_ID, weight: '250g', qty: 1 });

      expect(res.statusCode).toBe(404);
    });

    it('should reject adding more than available stock', async () => {
      (Product.findById as jest.Mock).mockResolvedValue({
        isActive: true,
        weights: [{ weight: '250g', stock: 2 }],
      });

      const res = await request(app)
        .post('/api/cart/add')
        .set('x-guest-session-id', GUEST_SESSION_ID)
        .send({ product: PRODUCT_ID, weight: '250g', qty: 5 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/insufficient stock/i);
    });

    it('should create a new cart and add the item when none exists yet', async () => {
      (Product.findById as jest.Mock).mockResolvedValue({
        isActive: true,
        weights: [{ weight: '250g', stock: 10 }],
      });
      (Cart.findOne as jest.Mock).mockResolvedValueOnce(null);
      (Cart.findById as jest.Mock).mockReturnValue(
        mockQuery({ items: [{ product: PRODUCT_ID, weight: '250g', qty: 1 }] }),
      );

      const res = await request(app)
        .post('/api/cart/add')
        .set('x-guest-session-id', GUEST_SESSION_ID)
        .send({ product: PRODUCT_ID, weight: '250g', qty: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should combine quantity when the item is already in the cart', async () => {
      (Product.findById as jest.Mock).mockResolvedValue({
        isActive: true,
        weights: [{ weight: '250g', stock: 10 }],
      });
      const existingCart = {
        items: [{ product: { toString: () => PRODUCT_ID }, weight: '250g', qty: 2 }],
        save: jest.fn().mockResolvedValue(true),
      };
      (Cart.findOne as jest.Mock).mockResolvedValueOnce(existingCart);
      (Cart.findById as jest.Mock).mockReturnValue(
        mockQuery({ items: [{ product: PRODUCT_ID, weight: '250g', qty: 5 }] }),
      );

      const res = await request(app)
        .post('/api/cart/add')
        .set('x-guest-session-id', GUEST_SESSION_ID)
        .send({ product: PRODUCT_ID, weight: '250g', qty: 3 });

      expect(res.statusCode).toBe(200);
      expect(existingCart.items[0].qty).toBe(5);
      expect(existingCart.save).toHaveBeenCalled();
    });
  });

  describe('PUT /api/cart/update', () => {
    it('should reject an invalid (zero) quantity at the validation layer', async () => {
      const res = await request(app)
        .put('/api/cart/update')
        .set('x-guest-session-id', GUEST_SESSION_ID)
        .send({ product: PRODUCT_ID, weight: '250g', qty: 0 });

      expect(res.statusCode).toBe(400);
    });

    it('should update the quantity of an existing item', async () => {
      (Product.findById as jest.Mock).mockResolvedValue({
        weights: [{ weight: '250g', stock: 10 }],
      });
      const existingCart = {
        items: [{ product: { toString: () => PRODUCT_ID }, weight: '250g', qty: 1 }],
        save: jest.fn().mockResolvedValue(true),
      };
      (Cart.findOne as jest.Mock).mockResolvedValueOnce(existingCart);
      (Cart.findById as jest.Mock).mockReturnValue(
        mockQuery({ items: [{ product: PRODUCT_ID, weight: '250g', qty: 4 }] }),
      );

      const res = await request(app)
        .put('/api/cart/update')
        .set('x-guest-session-id', GUEST_SESSION_ID)
        .send({ product: PRODUCT_ID, weight: '250g', qty: 4 });

      expect(res.statusCode).toBe(200);
      expect(existingCart.items[0].qty).toBe(4);
    });

    it('should 404 when updating an item not present in the cart', async () => {
      (Product.findById as jest.Mock).mockResolvedValue({
        weights: [{ weight: '250g', stock: 10 }],
      });
      (Cart.findOne as jest.Mock).mockResolvedValueOnce({ items: [], save: jest.fn() });

      const res = await request(app)
        .put('/api/cart/update')
        .set('x-guest-session-id', GUEST_SESSION_ID)
        .send({ product: PRODUCT_ID, weight: '250g', qty: 2 });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/cart/remove/:productId/:weight', () => {
    it('should remove the matching item from the cart', async () => {
      const existingCart = {
        items: [
          { product: { toString: () => PRODUCT_ID }, weight: '250g', qty: 1 },
          { product: { toString: () => 'other-product' }, weight: '100g', qty: 1 },
        ],
        save: jest.fn().mockResolvedValue(true),
      };
      (Cart.findOne as jest.Mock).mockResolvedValueOnce(existingCart);
      (Cart.findById as jest.Mock).mockReturnValue(mockQuery({ items: [] }));

      const res = await request(app)
        .delete(`/api/cart/remove/${PRODUCT_ID}/250g`)
        .set('x-guest-session-id', GUEST_SESSION_ID);

      expect(res.statusCode).toBe(200);
      expect(existingCart.items).toHaveLength(1);
      expect(existingCart.save).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/cart/clear', () => {
    it('should empty the cart', async () => {
      const existingCart = {
        items: [{ product: PRODUCT_ID, weight: '250g', qty: 1 }],
        save: jest.fn().mockResolvedValue(true),
      };
      (Cart.findOne as jest.Mock).mockResolvedValueOnce(existingCart);

      const res = await request(app)
        .delete('/api/cart/clear')
        .set('x-guest-session-id', GUEST_SESSION_ID);

      expect(res.statusCode).toBe(200);
      expect(existingCart.items).toEqual([]);
      expect(existingCart.save).toHaveBeenCalled();
    });
  });
});

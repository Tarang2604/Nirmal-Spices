import { Request, Response } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

// Get cart identifier (either authenticated user ID or guest sessionId)
const getCartSelector = (req: Request) => {
  if (req.user) {
    return { userId: req.user._id };
  }
  const sessionId = req.headers['x-guest-session-id'] as string | undefined;
  if (!sessionId) {
    throw ApiError.badRequest('Authentication or Guest Session ID header is required');
  }
  return { sessionId };
};

// ── GET CART ─────────────────────────────────────────────────────────
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  // Merge guest cart to user cart on login if x-guest-session-id is present
  if (req.user) {
    const sessionId = req.headers['x-guest-session-id'] as string | undefined;
    if (sessionId) {
      await mergeGuestCart(sessionId, req.user._id.toString());
    }
  }

  const selector = getCartSelector(req);

  const cart = await Cart.findOne(selector).populate({
    path: 'items.product',
    select: 'name slug category images weights isActive',
  });

  if (!cart) {
    // Return empty cart shape instead of throwing 404
    return sendSuccess(res, { items: [] }, 'Cart is empty');
  }

  // Filter out inactive products that might still be in cart
  const activeItems = cart.items.filter((item: any) => item.product && item.product.isActive);
  if (activeItems.length !== cart.items.length) {
    cart.items = activeItems;
    await cart.save();
  }

  return sendSuccess(res, cart, 'Cart fetched successfully');
});

// ── ADD TO CART ──────────────────────────────────────────────────────
export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const selector = getCartSelector(req);
  const { product: productId, weight, qty } = req.body;

  // Validate product and stock
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw ApiError.notFound('Product not found or inactive');
  }

  const variant = product.weights.find((w) => w.weight === weight);
  if (!variant) {
    throw ApiError.badRequest(`Weight variant '${weight}' is not available for this product`);
  }

  if (variant.stock < qty) {
    throw ApiError.badRequest(`Insufficient stock. Only ${variant.stock} units available.`);
  }

  let cart = await Cart.findOne(selector);
  if (!cart) {
    cart = new Cart({ ...selector, items: [] });
  }

  // Find if item already exists with same weight
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.weight === weight
  );

  if (itemIndex > -1) {
    const newQty = cart.items[itemIndex].qty + qty;
    if (variant.stock < newQty) {
      throw ApiError.badRequest(`Cannot add more. Insufficient stock. Max available: ${variant.stock}`);
    }
    cart.items[itemIndex].qty = newQty;
  } else {
    cart.items.push({ product: productId as any, weight, qty });
  }

  await cart.save();
  
  // Return populated cart
  const populatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name slug category images weights isActive',
  });

  return sendSuccess(res, populatedCart, 'Item added to cart');
});

// ── UPDATE CART ITEM QUANTITY ────────────────────────────────────────
export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const selector = getCartSelector(req);
  const { product: productId, weight, qty } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  const variant = product.weights.find((w) => w.weight === weight);
  if (!variant) throw ApiError.badRequest('Invalid weight variant');

  if (variant.stock < qty) {
    throw ApiError.badRequest(`Insufficient stock. Only ${variant.stock} units available.`);
  }

  const cart = await Cart.findOne(selector);
  if (!cart) throw ApiError.notFound('Cart not found');

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.weight === weight
  );

  if (itemIndex === -1) {
    throw ApiError.notFound('Item not found in cart');
  }

  cart.items[itemIndex].qty = qty;
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name slug category images weights isActive',
  });

  return sendSuccess(res, populatedCart, 'Cart item updated');
});

// ── REMOVE FROM CART ─────────────────────────────────────────────────
export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  const selector = getCartSelector(req);
  const { productId, weight } = req.params;

  const cart = await Cart.findOne(selector);
  if (!cart) throw ApiError.notFound('Cart not found');

  cart.items = cart.items.filter(
    (item) => !(item.product.toString() === productId && item.weight === weight)
  );

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name slug category images weights isActive',
  });

  return sendSuccess(res, populatedCart, 'Item removed from cart');
});

// ── CLEAR CART ───────────────────────────────────────────────────────
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const selector = getCartSelector(req);
  
  const cart = await Cart.findOne(selector);
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  return sendSuccess(res, { items: [] }, 'Cart cleared');
});

// ── MERGE GUEST CART TO USER CART (Triggered internally or via login API) ──
export async function mergeGuestCart(sessionId: string, userId: string): Promise<void> {
  const guestCart = await Cart.findOne({ sessionId });
  if (!guestCart || guestCart.items.length === 0) return;

  let userCart = await Cart.findOne({ userId });
  if (!userCart) {
    userCart = new Cart({ userId, items: [] });
  }

  for (const guestItem of guestCart.items) {
    const userItemIndex = userCart.items.findIndex(
      (item) =>
        item.product.toString() === guestItem.product.toString() &&
        item.weight === guestItem.weight
    );

    if (userItemIndex > -1) {
      // Prefer the higher quantity or combine them (capping at max limit e.g. 50)
      const combinedQty = Math.min(userCart.items[userItemIndex].qty + guestItem.qty, 50);
      userCart.items[userItemIndex].qty = combinedQty;
    } else {
      userCart.items.push(guestItem);
    }
  }

  await userCart.save();
  await guestCart.deleteOne(); // delete guest cart
}

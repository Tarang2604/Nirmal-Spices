import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

export interface ICartItem {
  product: {
    _id: string;
    name: string;
    slug: string;
    category: string;
    images: string[];
    weights: Array<{ weight: string; price: number; mrp: number; stock: number }>;
  };
  weight: string;
  qty: number;
}

interface CartState {
  items: ICartItem[];
  sessionId: string;
  loading: boolean;
  coupon: {
    code: string;
    discount: number;
    value: number;
    type: 'percent' | 'flat';
  } | null;
  initializeSession: () => string;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, weight: string, qty: number) => Promise<void>;
  updateQty: (productId: string, weight: string, qty: number) => Promise<void>;
  removeItem: (productId: string, weight: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string, discount: number, value: number, type: 'percent' | 'flat') => void;
  removeCoupon: () => void;
}

// Generate a client-side guest session ID safely
const getOrGenerateSession = () => {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('nirmal_cart_session_id');
  if (!id) {
    id = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('nirmal_cart_session_id', id);
  }
  return id;
};

// Axios helper headers for guest sessions
const getRequestConfig = (sessionId: string) => {
  return {
    headers: {
      'x-guest-session-id': sessionId,
    },
  };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: '',
      loading: false,
      coupon: null,

      initializeSession: () => {
        const id = getOrGenerateSession();
        set({ sessionId: id });
        return id;
      },

      fetchCart: async () => {
        let sid = get().sessionId;
        if (!sid) sid = get().initializeSession();

        set({ loading: true });
        try {
          const res = await api.get('/cart', getRequestConfig(sid));
          set({ items: res.data.data.items || [] });
        } catch {
          // Keep local state on fetch failures
        } finally {
          set({ loading: false });
        }
      },

      addItem: async (productId, weight, qty) => {
        let sid = get().sessionId;
        if (!sid) sid = get().initializeSession();

        set({ loading: true });
        try {
          const res = await api.post(
            '/cart/add',
            { product: productId, weight, qty },
            getRequestConfig(sid)
          );
          set({ items: res.data.data.items || [] });
        } finally {
          set({ loading: false });
        }
      },

      updateQty: async (productId, weight, qty) => {
        let sid = get().sessionId;
        if (!sid) sid = get().initializeSession();

        set({ loading: true });
        try {
          const res = await api.put(
            '/cart/update',
            { product: productId, weight, qty },
            getRequestConfig(sid)
          );
          set({ items: res.data.data.items || [] });
        } finally {
          set({ loading: false });
        }
      },

      removeItem: async (productId, weight) => {
        let sid = get().sessionId;
        if (!sid) sid = get().initializeSession();

        set({ loading: true });
        try {
          const res = await api.delete(
            `/cart/remove/${productId}/${weight}`,
            getRequestConfig(sid)
          );
          set({ items: res.data.data.items || [] });
        } finally {
          set({ loading: false });
        }
      },

      clearCart: async () => {
        let sid = get().sessionId;
        if (!sid) sid = get().initializeSession();

        set({ loading: true });
        try {
          await api.delete('/cart/clear', getRequestConfig(sid));
          set({ items: [], coupon: null });
        } finally {
          set({ loading: false });
        }
      },

      applyCoupon: (code, discount, value, type) => {
        set({ coupon: { code, discount, value, type } });
      },

      removeCoupon: () => {
        set({ coupon: null });
      },
    }),
    {
      name: 'nirmal_cart_store',
      // Only persist sessionId and coupon locally to avoid desyncs with cart items on multiple tabs
      partialize: (state) => ({ sessionId: state.sessionId, coupon: state.coupon }),
    }
  )
);

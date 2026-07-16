import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface WishlistState {
  ids: string[];
  loading: boolean;
  // Fetch server wishlist (call after login)
  fetchWishlist: () => Promise<void>;
  // Toggle wishlist — syncs to API if logged in, else local-only
  toggleWishlist: (productId: string, isLoggedIn: boolean) => Promise<void>;
  has: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      loading: false,

      fetchWishlist: async () => {
        set({ loading: true });
        try {
          const res = await api.get('/wishlist');
          const products: Array<{ _id: string }> = res.data.data || [];
          set({ ids: products.map((p) => p._id) });
        } catch {
          // Keep local state on fetch failures
        } finally {
          set({ loading: false });
        }
      },

      toggleWishlist: async (productId, isLoggedIn) => {
        if (!isLoggedIn) {
          // Guest: local-only toggle
          const current = get().ids;
          const exists = current.includes(productId);
          set({ ids: exists ? current.filter((id) => id !== productId) : [...current, productId] });
          return;
        }

        // Optimistic UI update
        const current = get().ids;
        const exists = current.includes(productId);
        set({ ids: exists ? current.filter((id) => id !== productId) : [...current, productId] });

        set({ loading: true });
        try {
          const res = await api.post('/wishlist/toggle', { productId });
          const { added } = res.data.data;
          // Sync with server response
          const latest = get().ids;
          if (added && !latest.includes(productId)) {
            set({ ids: [...latest, productId] });
          } else if (!added) {
            set({ ids: latest.filter((id) => id !== productId) });
          }
        } catch {
          // Revert optimistic update on error
          set({ ids: current });
        } finally {
          set({ loading: false });
        }
      },

      has: (id) => get().ids.includes(id),

      clearWishlist: () => set({ ids: [] }),
    }),
    {
      name: 'nirmal_wishlist_store',
    }
  )
);

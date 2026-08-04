import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface WishlistState {
  ids: string[];
  synced: boolean;
  setIds: (ids: string[]) => void;
  toggleWishlist: (id: string) => Promise<void>;
  syncFromServer: () => Promise<void>;
  has: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      synced: false,
      setIds: (ids) => set({ ids, synced: true }),
      has: (id) => get().ids.includes(id),
      clearWishlist: () => set({ ids: [], synced: false }),

      syncFromServer: async () => {
        try {
          const res = await api.get('/wishlist');
          const products = res.data.data || [];
          const ids = products.map((p: { _id: string }) => p._id);
          set({ ids, synced: true });
        } catch {
          // Guest or unauthenticated — keep local ids
          set({ synced: false });
        }
      },

      toggleWishlist: async (id) => {
        const current = get().ids;
        const exists = current.includes(id);
        // Optimistic local update
        const next = exists ? current.filter((item) => item !== id) : [...current, id];
        set({ ids: next });

        try {
          const res = await api.post(`/wishlist/${id}/toggle`);
          if (Array.isArray(res.data?.data?.ids)) {
            set({ ids: res.data.data.ids, synced: true });
          }
        } catch {
          // Revert if API fails (e.g. guest) — keep optimistic local state for guests
        }
      },
    }),
    {
      name: 'nirmal_wishlist_store',
      partialize: (state) => ({ ids: state.ids }),
    },
  ),
);

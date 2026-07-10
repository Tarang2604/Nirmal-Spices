import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  ids: string[];
  toggleWishlist: (id: string) => void;
  has: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggleWishlist: (id) => {
        const current = get().ids;
        const exists = current.includes(id);
        const next = exists 
          ? current.filter((item) => item !== id) 
          : [...current, id];
        set({ ids: next });
      },
      has: (id) => get().ids.includes(id),
      clearWishlist: () => set({ ids: [] }),
    }),
    {
      name: 'nirmal_wishlist_store',
    }
  )
);

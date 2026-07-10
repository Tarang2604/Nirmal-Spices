import { create } from 'zustand';

interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  toggleCart: () => void;
  toggleSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
}));

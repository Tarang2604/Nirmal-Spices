import { create } from 'zustand';

export interface IUserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  isVerified: boolean;
  addresses: any[];
}

interface AuthState {
  user: IUserProfile | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
  setUser: (user: IUserProfile) => void;
  clearUser: () => void;
  setInitialized: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isInitialized: false,
  setUser: (user) => set({ user, isLoggedIn: true }),
  clearUser: () => set({ user: null, isLoggedIn: false }),
  setInitialized: (val) => set({ isInitialized: val }),
}));

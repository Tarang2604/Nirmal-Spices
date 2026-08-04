"use client";

import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore, type IUserProfile } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

/**
 * Hydrates auth from httpOnly cookies via GET /auth/me on app load.
 * Retries once via /auth/refresh when access token has expired.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser, setInitialized, isInitialized } = useAuthStore();
  const { initializeSession, fetchCart } = useCartStore();
  const { syncFromServer, clearWishlist } = useWishlistStore();

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      const res = await api.get('/auth/me', { timeout: 12000 });
      return res.data.data as IUserProfile;
    }

    async function hydrate(fromFocus = false) {
      if (!fromFocus) initializeSession();
      try {
        let user: IUserProfile;
        try {
          user = await loadMe();
        } catch {
          await api.post('/auth/refresh', undefined, { timeout: 12000 });
          user = await loadMe();
        }
        if (cancelled) return;
        setUser(user);
        if (!fromFocus) {
          await Promise.allSettled([fetchCart(), syncFromServer()]);
        }
      } catch {
        if (!cancelled) {
          clearUser();
          clearWishlist();
        }
      } finally {
        if (!cancelled) setInitialized(true);
      }
    }

    if (!isInitialized) {
      void hydrate(false);
    }

    // Never leave the header stuck on the loading pulse
    const failSafe = window.setTimeout(() => {
      if (!cancelled && !useAuthStore.getState().isInitialized) {
        setInitialized(true);
      }
    }, 8000);

    const onFocus = () => {
      if (document.visibilityState !== 'visible') return;
      const state = useAuthStore.getState();
      if (!state.isInitialized || !state.isLoggedIn) return;
      void hydrate(true);
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

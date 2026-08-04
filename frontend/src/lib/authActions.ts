import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';

/**
 * Clear local auth UI immediately, then tell the API to drop cookies.
 * UI must not wait on the network before showing the Login state.
 */
export async function logoutNow(): Promise<void> {
  useAuthStore.getState().clearUser();
  useWishlistStore.getState().clearWishlist();

  try {
    await api.post('/auth/logout');
  } catch {
    // Cookies may already be gone — local state is already cleared
  }
}

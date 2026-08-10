import axios from 'axios';

export const api = axios.create({
  // Prefer same-origin `/backend-api` (Next rewrite → Express) so httpOnly cookies work.
  // Override with an absolute URL only when you intentionally call the API cross-origin.
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/backend-api',
  withCredentials: true, // Send httpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Attach guest cart session so login/register can merge carts server-side */
export function withGuestSession(sessionId?: string) {
  const id =
    sessionId ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('nirmal_cart_session_id') || undefined
      : undefined);
  return id
    ? { headers: { 'x-guest-session-id': id } }
    : {};
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for automatic 401 refresh token rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip redirect/refresh on auth entry points only (session probe /auth/me MUST refresh)
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/send-otp') ||
      originalRequest.url?.includes('/auth/verify-otp') ||
      originalRequest.url?.includes('/auth/admin/login')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        // Clear in-memory auth when refresh fails (cookies are invalid)
        if (typeof window !== 'undefined') {
          void Promise.all([
            import('@/store/authStore'),
            import('@/store/wishlistStore'),
          ]).then(([{ useAuthStore }, { useWishlistStore }]) => {
            useAuthStore.getState().clearUser();
            useAuthStore.getState().setInitialized(true);
            useWishlistStore.getState().clearWishlist();
          });
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  count?: number;
}

/** Shared category fetcher for React Query deduplication */
export async function fetchCategories(): Promise<ICategory[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to load categories');
  const json = await res.json();
  return (json.data || []) as ICategory[];
}

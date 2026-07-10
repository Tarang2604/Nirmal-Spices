import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  const isAuth = !!accessToken || !!refreshToken;

  // 1. Protect Admin routes
  if (pathname.startsWith('/admin')) {
    if (!isAuth) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Edge-safe JWT payload decode checking for admin role
    try {
      if (accessToken) {
        const payloadBase64 = accessToken.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64));
          if (payload.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
          }
        }
      }
    } catch {
      // Continue and let backend API authorize it strictly
    }
  }

  // 2. Protect Account routes
  if (pathname.startsWith('/account')) {
    if (!isAuth) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};

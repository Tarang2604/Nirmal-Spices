import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isAuth = !!accessToken || !!refreshToken;

  // Admin login is public
  if (pathname === '/admin/login') {
    if (isAuth && accessToken) {
      try {
        const payloadBase64 = accessToken.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64));
          if (payload.role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
          }
        }
      } catch {
        // fall through to login page
      }
    }
    return NextResponse.next();
  }

  // Protect remaining admin routes — redirect to admin login (not customer login)
  if (pathname.startsWith('/admin')) {
    if (!isAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      if (accessToken) {
        const payloadBase64 = accessToken.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64));
          if (payload.role !== 'admin') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
          }
        }
      }
    } catch {
      // Backend still enforces role
    }
  }

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

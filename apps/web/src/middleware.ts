import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'yellow-erp-secret-key-change-in-production');
const isDemoMode = !process.env.DATABASE_URL || process.env.DATABASE_URL === 'postgresql://demo:demo@localhost:5432/demo';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (isDemoMode) {
    return response;
  }

  const publicPaths = ['/login', '/register', '/auth/callback', '/forgot-password', '/reset-password'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');

  if (isPublicPath || isApiRoute) {
    return response;
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return response;
  } catch {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

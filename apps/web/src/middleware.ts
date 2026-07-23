import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'yellow-erp-secret-key-change-in-production');
const isDemoMode = !process.env.DATABASE_URL || process.env.DATABASE_URL === 'postgresql://demo:demo@localhost:5432/demo';

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  if (isDemoMode) return response;

  const pathname = request.nextUrl.pathname;

  // Public paths - no auth required
  const publicPaths = ['/', '/login', '/register', '/super-admin/login', '/auth/callback', '/forgot-password', '/reset-password'];
  if (publicPaths.some(path => pathname === path)) return response;

  // Static assets and internal Next.js paths
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) return response;

  // API routes - pass through (auth checked at route level)
  if (pathname.startsWith('/api/')) return response;

  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Determine where to redirect based on path
    if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
      return NextResponse.redirect(new URL('/super-admin/login', request.url));
    }
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const payload = await verifyToken(token);

  if (!payload) {
    // Invalid token - clear and redirect
    if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
      const response = NextResponse.redirect(new URL('/super-admin/login', request.url));
      response.cookies.set('auth-token', '', { path: '/', maxAge: 0 });
      return response;
    }
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('auth-token', '', { path: '/', maxAge: 0 });
    return response;
  }

  const roleType = payload.role_type as string | undefined;

  // Super admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
    if (roleType !== 'super_admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // Company dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (roleType === 'super_admin') {
      // Super admin trying to access company dashboard - redirect to admin panel
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // Company user - verify company_id exists
    if (!payload.company_id) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // Any other route - allow if authenticated
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

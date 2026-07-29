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
  const publicPaths = ['/', '/login', '/register', '/auth/callback', '/forgot-password', '/reset-password'];
  if (publicPaths.some(path => pathname === path)) return response;

  // Redirect super-admin login to unified login
  if (pathname === '/super-admin/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Static assets and internal Next.js paths
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) return response;

  // API routes - verify auth for company data routes
  if (pathname.startsWith('/api/')) {
    // Public API routes - no auth required
    const publicApiPaths = ['/api/health', '/api/upload', '/api/migrate', '/api/migrate-fix', '/api/payroll/migrate'];
    if (publicApiPaths.some(p => pathname.startsWith(p))) return response;

    // Public dynamic routes
    if (pathname.startsWith('/api/public/') || pathname.startsWith('/api/portal/')) return response;

    // Super admin API routes - handled by verifySuperAdmin in each route
    if (pathname.startsWith('/api/super-admin/') || pathname.startsWith('/api/auth/super-admin/')) return response;

    // Auth routes - no token verification needed
    if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register')) return response;

    // Company data routes - MUST verify JWT and company_id match
    if (pathname.startsWith('/api/companies/')) {
      const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
      }
      const payload = await verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: 'Token invalido' }, { status: 401 });
      }
      // Extract company_id from URL: /api/companies/{id}/...
      const urlParts = pathname.split('/');
      const urlCompanyId = urlParts[3]; // /api/companies/{id}
      const tokenCompanyId = payload.company_id as string | undefined;
      if (tokenCompanyId && urlCompanyId && tokenCompanyId !== urlCompanyId) {
        return NextResponse.json({ error: 'No autorizado para esta empresa' }, { status: 403 });
      }
      return response;
    }

    // All other API routes - pass through
    return response;
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // All unauthenticated routes redirect to unified login
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const payload = await verifyToken(token);

  if (!payload) {
    // Invalid token - clear and redirect to unified login
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

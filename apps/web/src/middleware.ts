import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { getJwtSecret } from '@/lib/env';
import { checkRateLimit, AUTH_CONFIG } from '@/lib/rate-limiter';

const intlMiddleware = createIntlMiddleware(routing);
const JWT_SECRET = getJwtSecret();

// Detect demo mode only when DATABASE_URL is explicitly absent (local dev signal)
const isLocalDev = !process.env.DATABASE_URL || process.env.DATABASE_URL?.includes('localhost');

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function setSecurityHeaders(response: NextResponse) {
  const headers = response.headers;
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '0');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  headers.set('Cache-Control', 'no-store, max-age=0');
}

export async function middleware(request: NextRequest) {
  // First, run next-intl locale detection middleware
  const intlResponse = intlMiddleware(request);
  if (intlResponse) return intlResponse;

  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  setSecurityHeaders(response);

  // Skip all auth checks in local dev mode (has no real security impact)
  if (isLocalDev) return response;

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

  // API routes
  if (pathname.startsWith('/api/')) {
    // Public API routes - no auth required
    const publicApiPaths = ['/api/health', '/api/upload', '/api/migrate', '/api/migrate-fix', '/api/payroll/migrate'];
    if (publicApiPaths.some(p => pathname.startsWith(p))) return response;

    // Public dynamic routes
    if (pathname.startsWith('/api/public/') || pathname.startsWith('/api/portal/')) return response;

    // Auth routes - no token verification needed (they issue tokens)
    if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register')) return response;

    // Rate limit auth-related mutation routes
    if (pathname.startsWith('/api/auth/')) {
      const ip = getClientIp(request);
      const { allowed, remaining, resetAt } = checkRateLimit(ip, pathname, AUTH_CONFIG);
      response.headers.set('X-RateLimit-Remaining', String(remaining));
      response.headers.set('X-RateLimit-Reset', String(resetAt));
      if (!allowed) {
        return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en 60 segundos.' }, { status: 429 });
      }
      return response;
    }

    // Super admin API routes - MUST verify JWT token and role
    if (pathname.startsWith('/api/super-admin/') || pathname.startsWith('/api/auth/super-admin/')) {
      const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
      }
      const payload = await verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: 'Token invalido' }, { status: 401 });
      }
      const roleType = payload.role_type as string | undefined;
      if (roleType !== 'super_admin') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }
      return response;
    }

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
      const urlCompanyId = urlParts[3];
      const tokenCompanyId = payload.company_id as string | undefined;
      const roleType = payload.role_type as string | undefined;
      // Super admins can access any company
      if (roleType !== 'super_admin' && tokenCompanyId && urlCompanyId && tokenCompanyId !== urlCompanyId) {
        return NextResponse.json({ error: 'No autorizado para esta empresa' }, { status: 403 });
      }
      return response;
    }

    // All other API routes - verify auth
    const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalido' }, { status: 401 });
    }
    return response;
  }

  // Page routes - require valid token
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    const resp = NextResponse.redirect(redirectUrl);
    resp.cookies.set('auth-token', '', { path: '/', maxAge: 0 });
    return resp;
  }

  const roleType = payload.role_type as string | undefined;

  // Super admin routes - require super_admin role
  if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
    if (roleType !== 'super_admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // Company dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (roleType === 'super_admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (!payload.company_id) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // Any other authenticated route
  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and authenticated dashboard areas.
    // Public pages (login/register/etc.) are intentionally NOT excluded so the
    // next-intl middleware localizes them into /[locale] where the
    // NextIntlClientProvider is mounted.
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|admin|ayuda|portal|view).*)',
  ],
};

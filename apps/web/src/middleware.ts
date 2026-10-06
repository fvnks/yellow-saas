import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { getJwtSecret } from '@/lib/env';
import { checkRateLimit, AUTH_CONFIG } from '@/lib/rate-limiter';

const intlMiddleware = createIntlMiddleware(routing);

const isLocalDev = !process.env.DATABASE_URL || process.env.DATABASE_URL?.includes('localhost');

async function verifyToken(token: string) {
  const JWT_SECRET = getJwtSecret();
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Token válido del portal de apoderados: firma OK y `tipo === 'apoderado'`. */
async function esTokenPortalValido(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload.tipo === 'apoderado' && typeof payload.id === 'string' && payload.id.length > 0;
  } catch {
    return false;
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
  const pathname = request.nextUrl.pathname;
  // next-intl usa prefijo de locale (ej: /es/dashboard); normalizar para los checks de auth
  const authPath = pathname.replace(/^\/(es|en)(?=\/|$)/, '') || '/';

  // ── API routes: skip next-intl entirely ──
  // next-intl rewrites /api/* → /es/api/* which causes 404s on all API routes.
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next({ request: { headers: request.headers } });
    setSecurityHeaders(response);
    if (isLocalDev) return response;

    const publicApiPaths = ['/api/health', '/api/upload', '/api/migrate', '/api/migrate-fix', '/api/payroll/migrate'];
    if (publicApiPaths.some(p => pathname.startsWith(p))) return response;

    if (pathname.startsWith('/api/public/') || pathname.startsWith('/api/portal/')) return response;

    // Portal de apoderados: registro y login son públicos; las rutas de datos
    // validan su propio token (tipo `apoderado`), que el middleware solo
    // comprueba por firma.
    if (pathname.startsWith('/api/portal-apoderado/')) return response;
    if (pathname.startsWith('/api/portal-profesor/')) return response;

    // Incluye login/register/login-unified a propósito: el rate limit de
    // AUTH_CONFIG (5 intentos/min por IP) solo protege lo que llega hasta aquí.
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

    if (pathname.startsWith('/api/super-admin/') || pathname.startsWith('/api/auth/super-admin/')) {
      const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
      if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
      const payload = await verifyToken(token);
      if (!payload) return NextResponse.json({ error: 'Token invalido' }, { status: 401 });
      if (payload.role_type !== 'super_admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      return response;
    }

    if (pathname.startsWith('/api/companies/')) {
      const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
      if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
      const payload = await verifyToken(token);
      if (!payload) return NextResponse.json({ error: 'Token invalido' }, { status: 401 });
      const urlCompanyId = pathname.split('/')[3];
      const tokenCompanyId = payload.company_id as string | undefined;
      if (payload.role_type !== 'super_admin' && tokenCompanyId && urlCompanyId && tokenCompanyId !== urlCompanyId) {
        return NextResponse.json({ error: 'No autorizado para esta empresa' }, { status: 403 });
      }
      return response;
    }

    const token = request.cookies.get('auth-token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Token invalido' }, { status: 401 });
    return response;
  }

  // ── Portal de apoderados: guard server-side ──
  // Corta con 307 **antes** de renderizar (el guard del layout del grupo
  // `(protegido)` queda como respaldo). Portada, login y aviso de registro
  // son públicos; el resto exige cookie `portal_token` con `tipo=apoderado`.
  if (pathname.startsWith('/portal-apoderado')) {
    const ruta = pathname.replace(/\/+$/, '');
    const portalResponse = NextResponse.next({ request: { headers: request.headers } });
    setSecurityHeaders(portalResponse);

    const rutasPublicas = new Set([
      '/portal-apoderado',
      '/portal-apoderado/login',
      '/portal-apoderado/registro',
    ]);
    if (rutasPublicas.has(ruta)) return portalResponse;

    const tokenPortal = request.cookies.get('portal_token')?.value;
    if (tokenPortal && (await esTokenPortalValido(tokenPortal))) return portalResponse;

    return NextResponse.redirect(new URL('/portal-apoderado/login?expired=1', request.url));
  }

  // ── Non-API routes: run next-intl locale detection ──
  const intlResponse = intlMiddleware(request);
  if (intlResponse) return intlResponse;

  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  setSecurityHeaders(response);

  if (isLocalDev) return response;

  const publicPaths = ['/', '/login', '/register', '/auth/callback', '/forgot-password', '/reset-password'];
  if (publicPaths.some(path => authPath === path)) return response;

  if (authPath === '/super-admin/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) return response;

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

  if (authPath.startsWith('/admin') || authPath.startsWith('/super-admin')) {
    if (roleType !== 'super_admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  if (authPath.startsWith('/dashboard')) {
    if (roleType === 'super_admin' && !payload.company_id) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (!payload.company_id) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|ico|js|css|woff2?|ttf|eot)$|admin|auto-talleres|ayuda|educacion|portal-profesor|view).*)',
  ],
};

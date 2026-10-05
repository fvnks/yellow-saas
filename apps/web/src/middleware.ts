import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Rutas que no requieren autenticación
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/portal-apoderado/login',
  '/api/portal-apoderado/register',
];

// Rutas del portal del apoderado que requieren autenticación
const portalApoderadoRoutes = [
  '/portal-apoderado/dashboard',
  '/portal-apoderado/notas',
  '/portal-apoderado/asistencia',
  '/portal-apoderado/comunicados',
  '/portal-apoderado/pagos',
  '/portal-apoderado/perfil',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar rutas del portal del apoderado
  if (portalApoderadoRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('portal_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.redirect(new URL('/portal-apoderado', request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/portal-apoderado', request.url));
    }
  }

  // Para el resto de rutas, verificar autenticación normal
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

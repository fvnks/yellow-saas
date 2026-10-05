import type { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { getJwtSecret } from '@/lib/env';

/**
 * Sesión del portal de apoderados.
 *
 * El JWT del portal se firma con el mismo `JWT_SECRET` que la app, por lo que
 * aquí se exige explícitamente `tipo === 'apoderado'`. Sin esa comprobación un
 * token de portal serviría como credencial de empresa (y al revés), porque
 * `verifyAuth` solo valida la firma.
 */
export interface PortalSession {
  id: string;
  email?: string;
  nombre?: string;
  tipo?: string;
  company_id?: string;
  [key: string]: unknown;
}

/** Lee el token desde el header Authorization o la cookie `portal_token`. */
export function extractPortalToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  if (header?.startsWith('Bearer ')) return header.substring(7);
  return request.cookies.get('portal_token')?.value ?? null;
}

/**
 * Valida la sesión del portal. Devuelve `null` cuando no hay credenciales
 * válidas o cuando el token no es de un apoderado.
 */
export async function verifyPortalAuth(request: NextRequest): Promise<PortalSession | null> {
  const token = extractPortalToken(request);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.tipo !== 'apoderado') return null;
    if (typeof payload.id !== 'string' || payload.id.length === 0) return null;
    return payload as PortalSession;
  } catch {
    return null;
  }
}

/**
 * Emite el JWT del portal (8h). Se usa tanto en el login como en el registro,
 * que deja al apoderado dentro del portal sin tener que volver a entrar.
 */
export async function crearTokenPortal(apoderado: {
  id: string;
  email?: string | null;
  nombres?: string | null;
  apellido_paterno?: string | null;
  company_id?: string | null;
}): Promise<string> {
  return new SignJWT({
    id: apoderado.id,
    email: apoderado.email ?? null,
    nombre: `${apoderado.nombres ?? ''} ${apoderado.apellido_paterno ?? ''}`.trim(),
    tipo: 'apoderado',
    company_id: apoderado.company_id ?? null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getJwtSecret());
}

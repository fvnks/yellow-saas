import type { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { getJwtSecret } from '@/lib/env';

/**
 * Sesión del portal de profesores.
 *
 * El JWT del portal se firma con el mismo `JWT_SECRET` que la app.
 * Aquí se exige explícitamente `tipo === 'profesor'`.
 */
export interface PortalProfesorSession {
  id: string;
  email?: string | null;
  nombre?: string | null;
  tipo?: string;
  company_id?: string | null;
  [key: string]: unknown;
}

/** Lee el token desde el header Authorization o la cookie `portal_profesor_token`. */
export function extractPortalProfesorToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  if (header?.startsWith('Bearer ')) return header.substring(7);
  return request.cookies.get('portal_profesor_token')?.value ?? null;
}

/**
 * Valida la sesión del portal de profesores. Devuelve `null` cuando no hay credenciales
 * válidas o cuando el token no es de un profesor.
 */
export async function verifyPortalProfesorAuth(request: NextRequest): Promise<PortalProfesorSession | null> {
  const token = extractPortalProfesorToken(request);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.tipo !== 'profesor') return null;
    if (typeof payload.id !== 'string' || payload.id.length === 0) return null;
    return payload as PortalProfesorSession;
  } catch {
    return null;
  }
}

/**
 * Emite el JWT del portal de profesores (8h).
 */
export async function crearTokenPortalProfesor(profesor: {
  id: string;
  email?: string | null;
  nombres?: string | null;
  apellido_paterno?: string | null;
  company_id?: string | null;
}): Promise<string> {
  return new SignJWT({
    id: profesor.id,
    email: profesor.email ?? null,
    nombre: `${profesor.nombres ?? ''} ${profesor.apellido_paterno ?? ''}`.trim(),
    tipo: 'profesor',
    company_id: profesor.company_id ?? null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getJwtSecret());
}

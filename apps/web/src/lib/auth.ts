/**
 * Autenticación de las rutas de API.
 *
 * `verifyAuth` valida el JWT emitido por `/api/auth/login` (cookie
 * `auth-token` o header `Authorization: Bearer`) y devuelve el payload
 * verificado. Retorna `null` cuando no hay credenciales válidas.
 */
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';

export interface AuthUser {
  sub?: string;
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  role_type?: string;
  company_id?: string;
  [key: string]: unknown;
}

/**
 * Obtiene el token desde el header Authorization o la cookie auth-token.
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return request.cookies.get('auth-token')?.value ?? null;
}

/**
 * Verifica la autenticación de un request.
 * Devuelve el payload del JWT o `null` si no es válido.
 */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  const token = extractToken(request);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    // Los tokens del portal de apoderados se firman con el mismo secreto que
    // la app. Si pasaran aquí, un apoderado podría consumir las APIs del
    // colegio. El claim `tipo` solo lo portan los tokens de portal.
    if (payload.tipo === 'apoderado') return null;

    return payload as AuthUser;
  } catch {
    return null;
  }
}

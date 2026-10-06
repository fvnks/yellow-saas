/**
 * Módulo de recuperación de clave para apoderados (módulo Educación).
 *
 * Patrones usados:
 * - Token JWT con purpose='password_reset', target_type='apoderado', target_id
 * - Almacenamiento temporal del token hash en la propia tabla (updated_at check)
 * - Email de reset con link /api/educacion/apoderados/password-reset-confirm?token=...
 * - Validación de fuerza de contraseña idéntica al formulario de registro
 */

import { randomBytes } from 'node:crypto';
import { SignJWT } from 'jose';
import { getJwtSecret } from '@/lib/env';
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

/**
 * Genera un token JWT de reset de clave para un apoderado.
 * Vida útil: 24 horas.
 * Claims: purpose='password_reset', target_type='apoderado', target_id (id del apoderado)
 */
export async function generarTokenReset(claveApoderadoId: string) {
  const secret = await getJwtSecret();
  const token = await new SignJWT({
    purpose: 'password_reset',
    target_type: 'apoderado',
    target_id: claveApoderadoId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  return token;
}

/**
 * Verifica un token de reset de clave y extrae los claims.
 * Retorna null si el token es inválido o expirado.
 */
export async function verificarTokenReset(token: string) {
  try {
    const secret = await getJwtSecret();
    const { payload } = await import('jose');
    const result = await payload.jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    return result.payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Envía el email de reset al apoderado.
 * Retorna la URL del link de reset que debe incluirse en el email.
 * NOTA: Este módulo solo construye el link; el envío real de email
 * debe integrarse con el servicio de emails del proyecto (SendGrid, SES, etc.).
 */
export function construirLinkReset(token: string, baseUrl: string) {
  const url = new URL('/api/educacion/apoderados/password-reset-confirm', baseUrl);
  url.searchParams.set('token', token);
  return url.toString();
}

/**
 * Valida que una contraseña cumpla los mismos requisitos que el registro.
 */
export function validarPassword(password: string): { valido: boolean; error?: string } {
  const PASSWORD_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

  if (password.length < 8) {
    return { valido: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return {
      valido: false,
      error:
        'La contraseña debe incluir mayúsculas, minúsculas, números y un carácter especial',
    };
  }
  return { valido: true };
}

/**
 * Actualiza la clave hasheada de un apoderado después de verificar el token.
 * Retorna el id actualizado o null si falla.
 */
export async function actualizarClaveApoderado(
  db: any,
  apoderadoId: string,
  nuevaPassword: string
) {
  const passwordHash = await hash(nuevaPassword, 12);

  const result = await db.query(
    `UPDATE educacion_apoderados SET password = $1, updated_at = now() WHERE id = $2 RETURNING id`,
    [passwordHash, apoderadoId]
  );

  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0].id;
}
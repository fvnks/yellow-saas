import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { getJwtSecret } from '@/lib/env';
import { timingSafeEqual } from 'crypto';
import { normalizarRut } from '@/lib/educacion/portal-registration';
import {
  clasificarIdentificador,
  claveIntentos,
  coincideNombreCompleto,
  tokenBusquedaNombre,
  type TipoIdentificador,
} from '@/lib/login-identifier';
import { limpiarIntentos, registrarFallo, segundosDeBloqueo } from '@/lib/login-attempts';

/**
 * Login único para personal, apoderados y profesores.
 *
 * El campo de usuario acepta **correo, RUT o "nombre y apellido"** (los dos
 * últimos solo en las tablas del módulo educación: el personal interno entra
 * por correo, como siempre). El claim `tipo` del token mantiene el aislamiento
 * de portales y la cookie se firma con la misma duración que el JWT (8h o
 * 30 días según el flag `recordar`).
 */

/**
 * Columnas por tabla: `educacion_apoderados` no tiene `estado` (solo existe
 * en `educacion_profesores`), así que cada consulta lleva las suyas.
 */
const COLUMNAS_APODERADO =
  'id, company_id, nombres, apellido_paterno, apellido_materno, email, rut, password';
const COLUMNAS_PROFESOR = `${COLUMNAS_APODERADO}, estado`;

type TablaPortal = 'educacion_apoderados' | 'educacion_profesores';

interface FilaPortal {
  id: string;
  company_id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  email?: string | null;
  rut?: string | null;
  password?: string | null;
  estado?: string;
}

function compararTextoSeguro(almacenada: string, recibida: string): boolean {
  const a = Buffer.from(almacenada, 'utf8');
  const b = Buffer.from(recibida, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Clave guardada: bcrypt (`$2…`) o texto plano legado. Vacía = sin clave. */
async function passwordCorrecta(almacenada: unknown, recibida: string): Promise<boolean> {
  const texto = typeof almacenada === 'string' ? almacenada : '';
  if (texto.startsWith('$2')) return bcrypt.compare(recibida, texto);
  if (texto.length > 0) return compararTextoSeguro(texto, recibida);
  return false;
}

function mensajeBloqueo(segundos: number): string {
  const minutos = Math.ceil(segundos / 60);
  return minutos <= 1
    ? 'Demasiados intentos fallidos. Espera un minuto y vuelve a intentarlo.'
    : `Demasiados intentos fallidos. Intenta de nuevo en ${minutos} minutos.`;
}

/**
 * Busca candidatos en una tabla del portal según el tipo de identificador.
 * En `nombre` devuelve `ambiguo` cuando varias cuentas coinciden: en ese caso
 * no se intenta la contraseña (evita adivinar a quién pertenece) y se pide
 * correo o RUT.
 */
async function buscarCandidatos(
  tabla: TablaPortal,
  columnas: string,
  tipo: TipoIdentificador,
  identificador: string
): Promise<{ filas: FilaPortal[]; ambiguo: boolean }> {
  if (tipo === 'email') {
    const resultado = await query(
      `SELECT ${columnas} FROM ${tabla} WHERE lower(email) = lower($1) LIMIT 2`,
      [identificador]
    );
    return { filas: resultado.rows as FilaPortal[], ambiguo: false };
  }

  if (tipo === 'rut') {
    // Compara sin puntos, guiones ni espacios: el colegio carga los RUT en
    // formatos variados y el usuario puede escribirlo de cualquier forma.
    const resultado = await query(
      `SELECT ${columnas} FROM ${tabla}
        WHERE upper(replace(replace(replace(rut, '.', ''), '-', ''), ' ', '')) =
              upper(replace(replace(replace($1, '.', ''), '-', ''), ' ', ''))
        LIMIT 2`,
      [normalizarRut(identificador)]
    );
    const filas = resultado.rows as FilaPortal[];
    return { filas, ambiguo: filas.length > 1 };
  }

  // nombre y apellido: busca candidatos por el último token (casi siempre el
  // apellido) con acentos normalizados vía translate() — sin depender de la
  // extensión unaccent — y afina en memoria exigiendo todos los tokens.
  const token = tokenBusquedaNombre(identificador);
  if (!token) return { filas: [], ambiguo: false };

  const resultado = await query(
    `SELECT ${columnas} FROM ${tabla}
      WHERE translate(lower(coalesce(apellido_paterno, '')), 'áéíóúüñ', 'aeiouun') = $1
         OR translate(lower(coalesce(apellido_materno, '')), 'áéíóúüñ', 'aeiouun') = $1
         OR translate(lower(coalesce(nombres, '')), 'áéíóúüñ', 'aeiouun') = $1
      LIMIT 50`,
    [token]
  );
  const filas = (resultado.rows as FilaPortal[]).filter((fila) =>
    coincideNombreCompleto(identificador, fila.nombres, fila.apellido_paterno, fila.apellido_materno)
  );
  return { filas, ambiguo: filas.length > 1 };
}

const MENSAJE_AMBIGUO =
  'Encontramos varias cuentas con esos datos. Ingresa con tu correo o tu RUT para continuar.';

export async function POST(request: NextRequest) {
  const JWT_SECRET = getJwtSecret();
  try {
    const body = await request.json();
    const password = typeof body.password === 'string' ? body.password : '';
    const identificador = String(body.identifier ?? body.email ?? '').trim();
    const recordar = Boolean(body.recordar ?? body.remember);

    if (!identificador || !password) {
      return errorResponse('Ingresa tu correo, RUT o nombre y tu contraseña', 400);
    }

    const tipo = clasificarIdentificador(identificador);
    const clave = claveIntentos(tipo, identificador);

    const bloqueo = segundosDeBloqueo(clave);
    if (bloqueo > 0) {
      return errorResponse(mensajeBloqueo(bloqueo), 429);
    }

    // Duración del token de portal: misma que la cookie que fija el cliente
    // (8h de visita, 30 días con "recordarme").
    const duracionPortal = recordar ? '30d' : '8h';

    // First check if this is a super admin (cuentas internas: solo correo)
    if (tipo === 'email') {
      const superAdminResult = await query(
        'SELECT id, email, name, password_hash, is_active FROM super_admins WHERE email = $1',
        [identificador]
      );

      if (superAdminResult.rows.length > 0) {
        const admin = superAdminResult.rows[0];

        if (!admin.is_active) {
          return errorResponse('Cuenta desactivada', 403);
        }

        if (!admin.password_hash) {
          return errorResponse('Cuenta sin contraseña configurada', 401);
        }

        const validPassword = await bcrypt.compare(password, admin.password_hash);
        if (!validPassword) {
          registrarFallo(clave);
          return errorResponse('Credenciales inválidas', 401);
        }

        limpiarIntentos(clave);
        await query('UPDATE super_admins SET last_login_at = now() WHERE id = $1', [admin.id]);

        const token = await new SignJWT({ id: admin.id, email: admin.email, name: admin.name, role_type: 'super_admin', role: 'super_admin' })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('7d')
          .sign(JWT_SECRET);

        return successResponse({
          token,
          user: { id: admin.id, email: admin.email, name: admin.name, role_type: 'super_admin' },
          redirectTo: '/admin',
        });
      }

      // Regular user login
      const result = await query(
        'SELECT id, email, full_name, company_id, role, password_hash FROM profiles WHERE email = $1 AND status = $2',
        [identificador, 'active']
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];

        if (!user.password_hash) {
          return errorResponse('Usuario sin contraseña', 401);
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
          registrarFallo(clave);
          return errorResponse('Contraseña incorrecta', 401);
        }

        let companies: any[] = [];
        try {
          const companiesResult = await query(
            `SELECT uc.company_id, uc.role AS company_role, uc.is_default,
                    c.name, c.slug, c.logo_url, c.plan, c.status
             FROM user_companies uc
             JOIN companies c ON c.id = uc.company_id
             WHERE uc.user_id = $1
             ORDER BY uc.is_default DESC, c.name ASC`,
            [user.id]
          );
          companies = companiesResult.rows;
        } catch (err) {
          console.warn('[LOGIN] user_companies unavailable, falling back to profiles:', err);
          const fallbackResult = await query(
            `SELECT p.company_id, p.role AS company_role, true AS is_default,
                    c.name, c.slug, c.logo_url, c.plan, c.status
             FROM profiles p
             JOIN companies c ON c.id = p.company_id
             WHERE p.id = $1 AND p.company_id IS NOT NULL`,
            [user.id]
          );
          companies = fallbackResult.rows;
        }

        const activeCompanyId = user.company_id;
        const activeCompany = companies.find(c => c.company_id === activeCompanyId) || companies[0];

        const token = await new SignJWT({
          id: user.id,
          email: user.email,
          name: user.full_name,
          company_id: activeCompanyId,
          role: activeCompany?.company_role || user.role,
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('7d')
          .sign(JWT_SECRET);

        limpiarIntentos(clave);

        return successResponse({
          token,
          company_id: activeCompanyId,
          user: {
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: activeCompany?.company_role || user.role,
          },
          companies: companies.map(c => ({
            id: c.company_id,
            name: c.name,
            slug: c.slug,
            logo_url: c.logo_url,
            plan: c.plan,
            status: c.status,
            role: c.company_role,
            is_default: c.is_default,
            is_active: c.company_id === activeCompanyId,
          })),
          redirectTo: '/select',
        });
      }
    }

    // ── Apoderados (correo, RUT o nombre y apellido) ──
    const apoderados = await buscarCandidatos(
      'educacion_apoderados',
      COLUMNAS_APODERADO,
      tipo,
      identificador
    );

    if (apoderados.ambiguo) {
      return errorResponse(MENSAJE_AMBIGUO, 409);
    }

    if (apoderados.filas.length > 0) {
      const apoderado = apoderados.filas[0];

      if (!(await passwordCorrecta(apoderado.password, password))) {
        registrarFallo(clave);
        return errorResponse('Credenciales inválidas', 401);
      }

      limpiarIntentos(clave);

      const apoderadoToken = await new SignJWT({
        id: apoderado.id,
        email: apoderado.email,
        nombre: `${apoderado.nombres ?? ''} ${apoderado.apellido_paterno ?? ''}`.trim(),
        tipo: 'apoderado',
        company_id: apoderado.company_id,
        role_type: 'apoderado',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(duracionPortal)
        .sign(JWT_SECRET);

      return successResponse({
        token: apoderadoToken,
        user: {
          id: apoderado.id,
          email: apoderado.email,
          name: `${apoderado.nombres ?? ''} ${apoderado.apellido_paterno ?? ''}`.trim(),
          role_type: 'apoderado',
          tipo: 'apoderado',
        },
        redirectTo: '/portal-apoderado/dashboard',
        tokenType: 'apoderado',
      });
    }

    // ── Profesores (correo, RUT o nombre y apellido) ──
    const profesores = await buscarCandidatos(
      'educacion_profesores',
      COLUMNAS_PROFESOR,
      tipo,
      identificador
    );

    if (profesores.ambiguo) {
      return errorResponse(MENSAJE_AMBIGUO, 409);
    }

    if (profesores.filas.length > 0) {
      const profesor = profesores.filas[0];
      const almacenada = typeof profesor.password === 'string' ? profesor.password : '';

      if (profesor.estado !== 'activo') {
        return errorResponse('Cuenta desactivada', 403);
      }

      if (!(await passwordCorrecta(almacenada, password))) {
        registrarFallo(clave);
        return errorResponse('Credenciales inválidas', 401);
      }

      limpiarIntentos(clave);

      const profesorToken = await new SignJWT({
        id: profesor.id,
        email: profesor.email,
        nombre: `${profesor.nombres ?? ''} ${profesor.apellido_paterno ?? ''}`.trim(),
        tipo: 'profesor',
        company_id: profesor.company_id,
        role_type: 'profesor',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(duracionPortal)
        .sign(JWT_SECRET);

      return successResponse({
        token: profesorToken,
        user: {
          id: profesor.id,
          email: profesor.email,
          name: `${profesor.nombres ?? ''} ${profesor.apellido_paterno ?? ''}`.trim(),
          role_type: 'profesor',
          tipo: 'profesor',
        },
        redirectTo: '/portal-profesor/dashboard',
        tokenType: 'profesor',
      });
    }

    registrarFallo(clave);
    return errorResponse('Credenciales inválidas', 401);
  } catch (err) {
    console.error('Unified login error:', err);
    return errorResponse('Internal server error', 500);
  }
}

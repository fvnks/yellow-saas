import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { getJwtSecret } from '@/lib/env';
import { timingSafeEqual } from 'crypto';

function compararTextoSeguro(almacenada: string, recibida: string): boolean {
  const a = Buffer.from(almacenada, 'utf8');
  const b = Buffer.from(recibida, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const JWT_SECRET = getJwtSecret();
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // First check if this is a super admin
    const superAdminResult = await query(
      'SELECT id, email, name, password_hash, is_active FROM super_admins WHERE email = $1',
      [email]
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
        return errorResponse('Credenciales inválidas', 401);
      }

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
      [email, 'active']
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      if (!user.password_hash) {
        return errorResponse('Usuario sin contraseña', 401);
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
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

    // Try apoderado
    const apoderadoResult = await query(
      `SELECT id, company_id, nombres, apellido_paterno, apellido_materno,
              email, password
       FROM educacion_apoderados
       WHERE lower(email) = lower($1)`,
      [email]
    );

    if (apoderadoResult.rows.length > 0) {
      const apoderado = apoderadoResult.rows[0];
      const almacenada = typeof apoderado.password === 'string' ? apoderado.password : '';
      let passwordOk = false;

      if (almacenada.startsWith('$2')) {
        passwordOk = await bcrypt.compare(password, almacenada);
      } else if (almacenada.length > 0) {
        passwordOk = compararTextoSeguro(almacenada, String(password));
      }

      if (!passwordOk) {
        return errorResponse('Credenciales inválidas', 401);
      }

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
        .setExpirationTime('8h')
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

    // Try profesor
    const profesorResult = await query(
      `SELECT id, company_id, nombres, apellido_paterno, apellido_materno,
              email, password, estado
       FROM educacion_profesores
       WHERE lower(email) = lower($1)`,
      [email]
    );

    if (profesorResult.rows.length > 0) {
      const profesor = profesorResult.rows[0];
      if (profesor.estado !== 'activo') {
        return errorResponse('Cuenta desactivada', 403);
      }

      const almacenada = typeof profesor.password === 'string' ? profesor.password : '';
      let passwordOk = false;

      if (almacenada.startsWith('$2')) {
        passwordOk = await bcrypt.compare(password, almacenada);
      } else if (almacenada.length > 0) {
        passwordOk = compararTextoSeguro(almacenada, String(password));
      }

      if (!passwordOk) {
        return errorResponse('Credenciales inválidas', 401);
      }

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
        .setExpirationTime('8h')
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

    return errorResponse('Credenciales inválidas', 401);
  } catch (err) {
    console.error('Unified login error:', err);
    return errorResponse('Internal server error', 500);
  }
}

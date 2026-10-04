import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';
import { SignJWT } from 'jose';
import { getJwtSecret } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * Permite a un Super Administrador entrar a un módulo de empresa sin ser
 * usuario de esa empresa: emite un token con role_type=super_admin PERO con
 * company_id seteado, para que el cliente (getApiClient) pueda resolver la
 * empresa y el middleware lo deje pasar por /dashboard y el resto de módulos.
 *
 * El token es de corta duración (4h) y mantiene role_type=super_admin, así que
 * los helpers de tenant siguen permitiendo acceso a cualquier company.
 */
export async function POST(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const JWT_SECRET = getJwtSecret();

  const body = await request.json();
  const { company_id } = body;

  if (!company_id) return errorResponse('company_id es requerido', 400);

  try {
    const companyResult = await query(
      `SELECT id, name, slug, logo_url, plan, status FROM companies WHERE id = $1`,
      [company_id]
    );

    if (companyResult.rows.length === 0) return errorResponse('Empresa no encontrada', 404);

    const company = companyResult.rows[0];

    const token = await new SignJWT({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role_type: 'super_admin',
      role: 'super_admin',
      company_id: company.id,
      super_admin: true,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('4h')
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          logo_url: company.logo_url,
          plan: company.plan,
          status: company.status,
        },
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 4 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error('Super admin switch company error:', err);
    return errorResponse('Error al cambiar de empresa', 500);
  }
}

import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { getJwtSecret } from '@/lib/env';

const JWT_SECRET = getJwtSecret();

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return errorResponse('No autorizado', 401);
    }

    let payload;
    try {
      const { payload: verified } = await jwtVerify(token, JWT_SECRET);
      payload = verified as any;
    } catch {
      return errorResponse('Token inválido', 401);
    }

    const body = await request.json();
    const { company_id } = body;

    if (!company_id) {
      return errorResponse('company_id es requerido', 400);
    }

    const userId = payload.id;

    // Check if user has access to the target company
    let hasAccess = false;
    let userRole = 'member';

    try {
      const result = await query(
        `SELECT role FROM user_companies WHERE user_id = $1 AND company_id = $2`,
        [userId, company_id]
      );
      if (result.rows.length > 0) {
        hasAccess = true;
        userRole = result.rows[0].role;
      }
    } catch {
      // user_companies table doesn't exist, check profiles
      const result = await query(
        `SELECT role FROM profiles WHERE id = $1 AND company_id = $2`,
        [userId, company_id]
      );
      if (result.rows.length > 0) {
        hasAccess = true;
        userRole = result.rows[0].role;
      }
    }

    if (!hasAccess) {
      return errorResponse('No tienes acceso a esta empresa', 403);
    }

    // Get company info
    const companyResult = await query(
      `SELECT id, name, slug, logo_url, plan, status FROM companies WHERE id = $1`,
      [company_id]
    );

    if (companyResult.rows.length === 0) {
      return errorResponse('Empresa no encontrada', 404);
    }

    const company = companyResult.rows[0];

    // Generate new JWT with the new company_id
    const newToken = await new SignJWT({
      id: payload.id,
      email: payload.email,
      name: payload.name,
      company_id: company_id,
      role: userRole,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    return successResponse({
      token: newToken,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logo_url: company.logo_url,
        plan: company.plan,
        status: company.status,
        role: userRole,
      },
    });
  } catch (err) {
    console.error('Switch company error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500);
  }
}

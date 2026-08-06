import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';

const JWT_SECRET = getJwtSecret();

export async function GET(request: NextRequest) {
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

    const userId = payload.id;

    // Try user_companies table first
    let companies;
    try {
      const result = await query(
        `SELECT uc.company_id, uc.role AS company_role, uc.is_default,
                c.name, c.slug, c.logo_url, c.plan, c.status
         FROM user_companies uc
         JOIN companies c ON c.id = uc.company_id
         WHERE uc.user_id = $1
         ORDER BY uc.is_default DESC, c.name ASC`,
        [userId]
      );
      companies = result.rows;
    } catch {
      // user_companies table doesn't exist yet, fallback to profiles
      const result = await query(
        `SELECT p.company_id, p.role AS company_role, true AS is_default,
                c.name, c.slug, c.logo_url, c.plan, c.status
         FROM profiles p
         JOIN companies c ON c.id = p.company_id
         WHERE p.id = $1 AND p.company_id IS NOT NULL`,
        [userId]
      );
      companies = result.rows;
    }

    return successResponse({
      companies: companies.map(c => ({
        id: c.company_id,
        name: c.name,
        slug: c.slug,
        logo_url: c.logo_url,
        plan: c.plan,
        status: c.status,
        role: c.company_role,
        is_default: c.is_default,
        is_active: c.company_id === payload.company_id,
      })),
    });
  } catch (err) {
    console.error('Get companies error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal server error', 500);
  }
}

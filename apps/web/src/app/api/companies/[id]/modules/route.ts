import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';
import { jwtVerify } from 'jose';
import { getJwtSecret } from '@/lib/env';

const JWT_SECRET = getJwtSecret();

async function getUserFromRequest(request: NextRequest): Promise<{ id: string; company_id: string; role: string } | null> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.company_id) return null;
    return { id: payload.id as string, company_id: payload.company_id as string, role: payload.role as string };
  } catch (err) {
    console.error('Silenced error:', err);
    return null;
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  const user = admin ? null : await getUserFromRequest(request);

  if (!admin && !user) return errorResponse('No autorizado', 401);
 if (user && user.company_id !== params.id) return errorResponse('Acceso denegado', 403);

  try {
    const companyId = params.id;

    const result = await query(
      `SELECT ma.*, mc.name as display_name, mc.description, mc.icon, mc.route
       FROM module_activations ma
       LEFT JOIN module_catalog mc ON mc.name = ma.module_name
       WHERE ma.company_id = $1 AND ma.status = 'active'
       ORDER BY mc.name`,
      [companyId]
    );

    return successResponse({ modules: result.rows });
  } catch (err) {
    console.error('Get modules error:', err);
    return successResponse({ modules: [] });
  }
}

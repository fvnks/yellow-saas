import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const result = await query(`
      SELECT 
        c.id, c.name, c.slug, c.plan, c.status, c.created_at, c.trial_ends_at,
        (SELECT COUNT(*) FROM profiles WHERE company_id = c.id) as user_count
      FROM companies c
      ORDER BY c.created_at DESC
    `);

    return successResponse(result.rows);
  } catch (err) {
    console.error('Companies list error:', err);
    return errorResponse('Error al obtener empresas', 500);
  }
}

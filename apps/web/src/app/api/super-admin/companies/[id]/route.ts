import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const { id } = params;

  try {
    const companyResult = await query('SELECT * FROM companies WHERE id = $1', [id]);
    if (companyResult.rows.length === 0) return errorResponse('Empresa no encontrada', 404);

    const usersResult = await query(
      'SELECT id, email, full_name, role, status, created_at FROM profiles WHERE company_id = $1 ORDER BY created_at',
      [id]
    );

    const grantsResult = await query(`
      SELECT 
        g.id, g.access_level, g.reason, g.is_active, g.expires_at, g.created_at,
        sa.name as super_admin_name, sa.email as super_admin_email
      FROM company_access_grants g
      JOIN super_admins sa ON sa.id = g.super_admin_id
      WHERE g.company_id = $1
      ORDER BY g.created_at DESC
    `, [id]);

    return successResponse({
      ...companyResult.rows[0],
      users: usersResult.rows,
      grants: grantsResult.rows,
    });
  } catch (err) {
    console.error('Company detail error:', err);
    return errorResponse('Error al obtener empresa', 500);
  }
}

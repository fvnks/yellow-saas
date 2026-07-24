import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const result = await query(`
      SELECT 
        aal.id, aal.action, aal.details, aal.ip_address, aal.created_at,
        sa.name as super_admin_name, sa.email as super_admin_email,
        c.name as company_name
      FROM access_audit_log aal
      JOIN super_admins sa ON sa.id = aal.super_admin_id
      JOIN companies c ON c.id = aal.company_id
      ORDER BY aal.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await query('SELECT COUNT(*) as total FROM access_audit_log');

    return successResponse({
      entries: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    });
  } catch (err) {
    console.error('Audit log error:', err);
    return errorResponse('Error al obtener audit log', 500);
  }
}

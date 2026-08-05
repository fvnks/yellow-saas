import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const counts = await query(`
      SELECT
        COUNT(*) FILTER (WHERE t.status = 'open') as open,
        COUNT(*) FILTER (WHERE t.status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE t.status IN ('open', 'in_progress')) as pending,
        COUNT(*) FILTER (WHERE t.status IN ('open', 'in_progress') AND t.assigned_to IS NULL) as unassigned
      FROM support_tickets t
    `);

    const recent = await query(`
      SELECT
        t.id, t.subject, t.status, t.priority, t.created_at,
        c.name as company_name
      FROM support_tickets t
      JOIN companies c ON c.id = t.company_id
      WHERE t.status IN ('open', 'in_progress')
      ORDER BY t.created_at DESC
      LIMIT 10
    `);

    return successResponse({
      ...counts.rows[0],
      recent: recent.rows,
    });
  } catch (err) {
    console.error('Support summary error:', err);
    return errorResponse('Error al obtener resumen', 500);
  }
}

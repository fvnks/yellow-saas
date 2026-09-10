import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'companies';
  const companyId = searchParams.get('company_id');

  try {
    if (type === 'companies') {
      if (companyId) {
        const result = await query(`
          SELECT c.id, c.name, c.slug, c.plan, c.status, c.created_at, c.trial_ends_at,
            (SELECT COUNT(*) FROM profiles WHERE company_id = c.id) as user_count
          FROM companies c WHERE c.id = $1
        `, [companyId]);
        return successResponse({ type: 'company', data: result.rows });
      }
      const result = await query(`
        SELECT c.id, c.name, c.slug, c.plan, c.status, c.created_at,
          (SELECT COUNT(*) FROM profiles WHERE company_id = c.id) as user_count
        FROM companies c ORDER BY c.created_at DESC
      `);
      return successResponse({ type: 'companies', data: result.rows });
    }

    if (type === 'users') {
      const conditions: string[] = [];
      const params: unknown[] = [];
      let paramIndex = 1;
      if (companyId) {
        conditions.push(`p.company_id = $${paramIndex}`);
        params.push(companyId);
        paramIndex++;
      }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const result = await query(`
        SELECT p.id, p.email, p.full_name, p.role, p.status, p.created_at,
          c.name as company_name
        FROM profiles p
        LEFT JOIN companies c ON c.id = p.company_id
        ${whereClause}
        ORDER BY p.created_at DESC
      `, params);
      return successResponse({ type: 'users', data: result.rows });
    }

    if (type === 'tickets') {
      const conditions: string[] = [];
      const params: unknown[] = [];
      let paramIndex = 1;
      if (companyId) {
        conditions.push(`t.company_id = $${paramIndex}`);
        params.push(companyId);
        paramIndex++;
      }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const result = await query(`
        SELECT t.id, t.subject, t.status, t.priority, t.created_at,
          c.name as company_name
        FROM support_tickets t
        JOIN companies c ON c.id = t.company_id
        ${whereClause}
        ORDER BY t.created_at DESC
      `, params);
      return successResponse({ type: 'tickets', data: result.rows });
    }

    return errorResponse('Tipo no válido', 400);
  } catch (err) {
    console.error('Export error:', err);
    return errorResponse('Error al exportar datos', 500);
  }
}

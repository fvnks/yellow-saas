import { query } from '@/api/lib/db';
import { successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import { verifySuperAdmin } from '@/api/super-admin/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  try {
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');
    const companyFilter = url.searchParams.get('company_id');

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(c.name ILIKE $${paramIndex} OR sa.name ILIKE $${paramIndex} OR sa.email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (statusFilter === 'active') {
      conditions.push(`g.is_active = true`);
    } else if (statusFilter === 'inactive') {
      conditions.push(`g.is_active = false`);
    }
    if (companyFilter) {
      conditions.push(`g.company_id = $${paramIndex}`);
      params.push(companyFilter);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM company_access_grants g
       JOIN companies c ON c.id = g.company_id
       JOIN super_admins sa ON sa.id = g.super_admin_id
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    const allowedSorts: Record<string, string> = { created_at: 'g.created_at', access_level: 'g.access_level' };
    const sortColumn = allowedSorts[sort] || 'g.created_at';

    const result = await query(
      `SELECT g.id, g.company_id, g.access_level, g.reason, g.is_active, g.expires_at, g.created_at,
        c.name as company_name,
        sa.name as super_admin_name, sa.email as super_admin_email,
        p.full_name as granted_by_name
       FROM company_access_grants g
       JOIN companies c ON c.id = g.company_id
       JOIN super_admins sa ON sa.id = g.super_admin_id
       LEFT JOIN profiles p ON p.id = g.granted_by
       ${whereClause}
       ORDER BY ${sortColumn} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (err) {
    console.error('Grants list error:', err);
    return errorResponse('Error al obtener accesos', 500);
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifySuperAdmin(request);
  if (!admin) return errorResponse('No autorizado', 401);

  const body = await request.json();
  const { company_id, access_level, reason, expires_at } = body;

  if (!company_id) return errorResponse('company_id es requerido', 400);

  try {
    const existing = await query(
      'SELECT id, is_active FROM company_access_grants WHERE company_id = $1 AND super_admin_id = $2',
      [company_id, admin.id]
    );

    if (existing.rows.length > 0) {
      await query(`
        UPDATE company_access_grants 
        SET is_active = true, access_level = $1, reason = $2, expires_at = $3, updated_at = now()
        WHERE id = $4
      `, [access_level || 'read', reason, expires_at, existing.rows[0].id]);
    } else {
      const ownerResult = await query(
        "SELECT id FROM profiles WHERE company_id = $1 AND role = 'owner' LIMIT 1",
        [company_id]
      );
      const grantedBy = ownerResult.rows[0]?.id || admin.id;

      await query(`
        INSERT INTO company_access_grants (company_id, super_admin_id, granted_by, access_level, reason, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [company_id, admin.id, grantedBy, access_level || 'read', reason, expires_at]);
    }

    await query(`
      INSERT INTO access_audit_log (super_admin_id, company_id, action, details)
      VALUES ($1, $2, 'access', $3)
    `, [admin.id, company_id, JSON.stringify({ access_level, reason })]);

    return successResponse({ success: true });
  } catch (err) {
    console.error('Grant create error:', err);
    return errorResponse('Error al crear acceso', 500);
  }
}

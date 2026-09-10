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
      conditions.push(`(p.full_name ILIKE $${paramIndex} OR p.email ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (statusFilter) {
      conditions.push(`p.status = $${paramIndex}`);
      params.push(statusFilter);
      paramIndex++;
    }
    if (companyFilter) {
      conditions.push(`p.company_id = $${paramIndex}`);
      params.push(companyFilter);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM profiles p LEFT JOIN companies c ON c.id = p.company_id ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    const allowedSorts: Record<string, string> = { created_at: 'p.created_at', email: 'p.email', full_name: 'p.full_name' };
    const sortColumn = allowedSorts[sort] || 'p.created_at';

    const result = await query(
      `SELECT p.id, p.email, p.full_name, p.role, p.status, p.created_at,
        c.name as company_name, c.id as company_id
       FROM profiles p
       LEFT JOIN companies c ON c.id = p.company_id
       ${whereClause}
       ORDER BY ${sortColumn} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (err) {
    console.error('Users list error:', err);
    return errorResponse('Error al obtener usuarios', 500);
  }
}

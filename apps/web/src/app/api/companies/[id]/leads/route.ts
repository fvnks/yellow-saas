import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, sort, order, offset } = parseSearchParams(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let where = 'WHERE l.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (status && status !== 'all') {
      where += ` AND l.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      where += ` AND (l.name ILIKE $${paramIndex} OR l.email ILIKE $${paramIndex} OR l.phone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const allowedSort = ['name', 'status', 'estimated_value', 'created_at'];
    const sortColumn = allowedSort.includes(sort) ? sort : 'created_at';

    const { rows } = await query(`
      SELECT l.*,
        COALESCE(p.first_name || ' ' || p.last_name, 'Sin asignar') as assigned_name
      FROM leads l
      LEFT JOIN profiles p ON l.assigned_to = p.id
      ${where}
      ORDER BY l.${sortColumn} ${order === 'desc' ? 'DESC' : 'ASC'}
      OFFSET $${paramIndex} LIMIT $${paramIndex + 1}
    `, [...params, offset, limit]);

    const { rows: countRows } = await query(`SELECT COUNT(*) FROM leads l ${where}`, params);
    const total = parseInt(countRows[0]?.count || '0');

    return paginatedResponse(rows, total, page, limit);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, email, phone, source, status, assigned_to, estimated_value, notes } = body;

    if (!name) return errorResponse('Name is required', 400);

    const { rows } = await query(`
      INSERT INTO leads (company_id, name, email, phone, source, status, assigned_to, estimated_value, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [companyId, name, email || null, phone || null, source || null, status || 'new', assigned_to || null, estimated_value || null, notes || null]);

    return successResponse(rows[0], 201);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

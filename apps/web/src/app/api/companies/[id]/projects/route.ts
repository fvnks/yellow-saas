import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'name', 'code', 'status', 'start_date', 'end_date', 'budget', 'progress', 'id'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';

    let whereClause = 'WHERE p.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.code ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const statusFilter = request.nextUrl.searchParams.get('status');
    if (statusFilter && statusFilter !== 'all') {
      whereClause += ` AND p.status = $${paramIndex}`;
      params.push(statusFilter);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM projects p LEFT JOIN customers c ON p.customer_id = c.id ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT p.*,
        c.name as customer_name,
        prof.full_name as project_manager_name,
        (SELECT COUNT(*) FROM project_tasks pt WHERE pt.project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM project_tasks pt WHERE pt.project_id = p.id AND pt.status = 'done') as completed_tasks
       FROM projects p
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN profiles prof ON p.project_manager_id = prof.id
       ${whereClause}
       ORDER BY p.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const {
      name, code, description, customer_id, start_date, end_date,
      budget, status, project_manager_id,
    } = body;

    if (!name) return errorResponse('Name is required', 400);
    if (!code) return errorResponse('Code is required', 400);

    const result = await query(
      `INSERT INTO projects (
        company_id, name, code, description, customer_id, start_date, end_date,
        budget, status, project_manager_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
      RETURNING *`,
      [companyId, name, code, description || null, customer_id || null,
       start_date || null, end_date || null, budget || 0,
       status || 'planning', project_manager_id || null]
    );

    return successResponse(result.rows[0], 201);
  } catch (err: any) {
    if (err?.code === '23505') return errorResponse('Project code already exists', 400);
    return errorResponse('Internal server error', 500);
  }
}

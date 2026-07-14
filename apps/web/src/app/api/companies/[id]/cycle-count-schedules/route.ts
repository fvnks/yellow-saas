import { query } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const warehouseId = url.searchParams.get('warehouse_id');
    const isActive = url.searchParams.get('is_active');
    const abcClassification = url.searchParams.get('abc_classification');

    let whereClause = 'WHERE ccs.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (warehouseId) {
      whereClause += ` AND ccs.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }

    if (isActive !== null) {
      whereClause += ` AND ccs.is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    if (abcClassification) {
      whereClause += ` AND ccs.abc_classification = $${paramIndex}`;
      params.push(abcClassification);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (ccs.name ILIKE $${paramIndex} OR ccs.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM cycle_count_schedules ccs ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT ccs.*,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse,
        json_build_object('id', c.id, 'name', c.name) as category,
        json_build_object('id', u.id, 'full_name', u.full_name) as responsible
       FROM cycle_count_schedules ccs
       LEFT JOIN warehouses w ON ccs.warehouse_id = w.id
       LEFT JOIN inventory_categories c ON ccs.category_id = c.id
       LEFT JOIN profiles u ON ccs.responsible_id = u.id
       ${whereClause}
       ORDER BY ccs.next_run_date
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Cycle count schedules error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description, frequency, abc_classification, category_id, warehouse_id, responsible_id, next_run_date } = body;

    if (!name || !frequency || !warehouse_id || !next_run_date) {
      return errorResponse('name, frequency, warehouse_id, and next_run_date are required', 400);
    }

    const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly'];
    if (!validFrequencies.includes(frequency)) {
      return errorResponse(`frequency must be one of: ${validFrequencies.join(', ')}`, 400);
    }

    const validAbc = ['A', 'B', 'C'];
    if (abc_classification && !validAbc.includes(abc_classification)) {
      return errorResponse(`abc_classification must be one of: ${validAbc.join(', ')}`, 400);
    }

    const result = await query(
      `INSERT INTO cycle_count_schedules (company_id, name, description, frequency, abc_classification, category_id, warehouse_id, responsible_id, next_run_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [companyId, name, description || null, frequency, abc_classification || null, category_id || null, warehouse_id, responsible_id || null, next_run_date]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Create cycle count schedule error:', err);
    return errorResponse('Internal server error', 500);
  }
}
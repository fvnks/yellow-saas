import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const warehouseId = url.searchParams.get('warehouse_id');
    const status = url.searchParams.get('status');

    let whereClause = 'WHERE pw.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (warehouseId) {
      whereClause += ` AND pw.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND pw.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (pw.wave_number ILIKE $${paramIndex} OR pw.notes ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM pick_waves pw ${whereClause}`,
      params
    );

    params.push(limit, offset);
    const dataResult = await query(
      `SELECT pw.*,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse,
        json_build_object('id', u.id, 'full_name', u.full_name) as assigned_user
       FROM pick_waves pw
       LEFT JOIN warehouses w ON pw.warehouse_id = w.id
       LEFT JOIN profiles u ON pw.assigned_to = u.id
       ${whereClause}
       ORDER BY pw.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Pick waves error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { wave_number, warehouse_id, priority, assigned_to, order_ids, delivery_guide_ids, notes } = body;

    if (!wave_number || !warehouse_id) {
      return errorResponse('wave_number and warehouse_id are required', 400);
    }

    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return errorResponse(`priority must be one of: ${validPriorities.join(', ')}`, 400);
    }

    const whCheck = await query('SELECT id FROM warehouses WHERE id = $1 AND company_id = $2', [warehouse_id, companyId]);
    if (whCheck.rows.length === 0) return errorResponse('Warehouse not found', 404);

    if (assigned_to) {
      const userCheck = await query('SELECT id FROM profiles WHERE id = $1 AND company_id = $2', [assigned_to, companyId]);
      if (userCheck.rows.length === 0) return errorResponse('Assigned user not found', 404);
    }

    const result = await query(
      `INSERT INTO pick_waves (company_id, wave_number, warehouse_id, priority, assigned_to, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft')
       RETURNING *`,
      [companyId, wave_number, warehouse_id, priority || 'normal', assigned_to || null, notes || null]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Create pick wave error:', err);
    if (err instanceof Error && err.message.includes('duplicate key')) {
      return errorResponse('Wave number already exists', 400);
    }
    return errorResponse('Internal server error', 500);
  }
}
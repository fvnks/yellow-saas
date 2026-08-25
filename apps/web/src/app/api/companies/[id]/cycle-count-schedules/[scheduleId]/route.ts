import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; scheduleId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT ccs.*,
        json_build_object('id', w.id, 'name', w.name, 'code', w.code) as warehouse,
        json_build_object('id', c.id, 'name', c.name) as category,
        json_build_object('id', u.id, 'full_name', u.full_name) as responsible,
        (SELECT json_agg(json_build_object(
          'id', ccr.id,
          'count_id', ccr.count_id,
          'status', ccr.status,
          'created_at', ccr.created_at,
          'completed_at', ccr.completed_at
        ) ORDER BY ccr.created_at DESC)
         FROM cycle_count_runs ccr WHERE ccr.schedule_id = ccs.id) as runs
       FROM cycle_count_schedules ccs
       LEFT JOIN warehouses w ON ccs.warehouse_id = w.id
       LEFT JOIN inventory_categories c ON ccs.category_id = c.id
       LEFT JOIN profiles u ON ccs.responsible_id = u.id
       WHERE ccs.id = $1 AND ccs.company_id = $2`,
      [params.scheduleId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Schedule not found', 404);

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Get cycle count schedule error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; scheduleId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description, frequency, abc_classification, category_id, warehouse_id, responsible_id, next_run_date, is_active } = body;

    const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly'];
    if (frequency && !validFrequencies.includes(frequency)) {
      return errorResponse(`frequency must be one of: ${validFrequencies.join(', ')}`, 400);
    }

    const validAbc = ['A', 'B', 'C'];
    if (abc_classification && !validAbc.includes(abc_classification)) {
      return errorResponse(`abc_classification must be one of: ${validAbc.join(', ')}`, 400);
    }

    const result = await query(
      `UPDATE cycle_count_schedules SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        frequency = COALESCE($3, frequency),
        abc_classification = COALESCE($4, abc_classification),
        category_id = COALESCE($5, category_id),
        warehouse_id = COALESCE($6, warehouse_id),
        responsible_id = COALESCE($7, responsible_id),
        next_run_date = COALESCE($8, next_run_date),
        is_active = COALESCE($9, is_active),
        updated_at = NOW()
       WHERE id = $10 AND company_id = $11
       RETURNING *`,
      [name, description, frequency, abc_classification, category_id, warehouse_id, responsible_id, next_run_date, is_active, params.scheduleId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Schedule not found', 404);

    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Update cycle count schedule error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; scheduleId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      'DELETE FROM cycle_count_schedules WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.scheduleId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Schedule not found', 404);

    return successResponse({ message: 'Schedule deleted successfully' });
  } catch (err) {
    console.error('Delete cycle count schedule error:', err);
    return errorResponse('Internal server error', 500);
  }
}
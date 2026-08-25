import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let sql = `SELECT pt.*, e.first_name || ' ' || e.last_name as employee_name, pt.task_id,
      (pt.elapsed_seconds / 3600) as hours_decimal
       FROM project_timers pt
       JOIN employees e ON e.id = pt.employee_id
       WHERE pt.project_id = $1 AND pt.company_id = $2`;
    const args: any[] = [params.projectId, companyId];

    if (activeOnly) {
      sql += ' AND pt.stopped_at IS NULL';
    }

    sql += ' ORDER BY pt.started_at DESC';

    const result = await query(sql, args);
    return successResponse(result.rows);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { employee_id, task_id, description } = body;

    if (!employee_id) return errorResponse('employee_id is required', 400);

    const activeTimer = await query(
      'SELECT id FROM project_timers WHERE employee_id = $1 AND stopped_at IS NULL AND company_id = $2',
      [employee_id, companyId]
    );

    if (activeTimer.rows.length > 0) {
      return errorResponse('Employee already has an active timer. Stop it first.', 400);
    }

    const result = await query(
      `INSERT INTO project_timers (company_id, project_id, task_id, employee_id, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [companyId, params.projectId, task_id || null, employee_id, description || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { timer_id, action } = body;

    if (!timer_id || !action) return errorResponse('timer_id and action required', 400);

    if (action === 'stop') {
      const result = await query(
        `UPDATE project_timers SET stopped_at = now()
         WHERE id = $1 AND project_id = $2 AND company_id = $3 AND stopped_at IS NULL
         RETURNING *, (elapsed_seconds / 3600.0) as hours_decimal`,
        [timer_id, params.projectId, companyId]
      );

      if (result.rows.length === 0) return errorResponse('Timer not found or already stopped', 404);

      const timer = result.rows[0];

      if (timer.task_id) {
        const hours = parseFloat(timer.hours_decimal);
        await query(
          `INSERT INTO project_timesheets (company_id, project_id, task_id, employee_id, date, hours, description)
           VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6)`,
          [companyId, params.projectId, timer.task_id, timer.employee_id, hours, timer.description || 'Tracked via timer']
        );
      }

      return successResponse(timer);
    }

    return errorResponse('Invalid action', 400);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

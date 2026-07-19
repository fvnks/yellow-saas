import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string; timesheetId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);
    const body = await request.json();

    const result = await query(
      `UPDATE project_timesheets SET task_id=$1, employee_id=$2, date=$3, hours=$4, description=$5, billable=$6, approved=$7, updated_at=NOW()
       WHERE id=$8 AND project_id=$9 AND company_id=$10 RETURNING *`,
      [body.task_id, body.employee_id, body.date, body.hours, body.description, body.billable, body.approved || false,
       params.timesheetId, params.projectId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Timesheet not found', 404);
    return successResponse(result.rows[0]);
  } catch { return errorResponse('Internal server error', 500); }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string; timesheetId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);
    const result = await query(
      'DELETE FROM project_timesheets WHERE id=$1 AND project_id=$2 AND company_id=$3 RETURNING id',
      [params.timesheetId, params.projectId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Timesheet not found', 404);
    return successResponse({ message: 'Deleted' });
  } catch { return errorResponse('Internal server error', 500); }
}

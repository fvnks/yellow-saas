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

    if (body.action === 'approve' || body.action === 'reject') {
      const approved = body.action === 'approve';
      const result = await query(
        `UPDATE project_timesheets SET
          approved=$1, approved_by=$2, approved_at=CASE WHEN $1 THEN NOW() ELSE NULL END, updated_at=NOW()
         WHERE id=$3 AND project_id=$4 AND company_id=$5 RETURNING *`,
        [approved, body.approved_by || null, params.timesheetId, params.projectId, companyId]
      );
      if (result.rows.length === 0) return errorResponse('Timesheet not found', 404);
      return successResponse(result.rows[0]);
    }

    const result = await query(
      `UPDATE project_timesheets SET task_id=$1, employee_id=$2, date=$3, hours=$4, description=$5, billable=$6, updated_at=NOW()
       WHERE id=$7 AND project_id=$8 AND company_id=$9 RETURNING *`,
      [body.task_id, body.employee_id, body.date, body.hours, body.description, body.billable,
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

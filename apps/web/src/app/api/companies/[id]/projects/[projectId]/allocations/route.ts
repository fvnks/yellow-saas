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

    const result = await query(
      `SELECT ra.*, e.first_name || ' ' || e.last_name as employee_name, e.position,
        (SELECT COALESCE(SUM(pt.hours), 0) FROM project_timesheets pt
         WHERE pt.employee_id = ra.employee_id AND pt.project_id = ra.project_id
           AND pt.date >= CURRENT_DATE - INTERVAL '7 days') as hours_this_week,
        (SELECT COALESCE(SUM(pt.hours), 0) FROM project_timesheets pt
         WHERE pt.employee_id = ra.employee_id AND pt.project_id = ra.project_id
           AND pt.date >= DATE_TRUNC('month', CURRENT_DATE)) as hours_this_month
       FROM project_resource_allocations ra
       JOIN employees e ON e.id = ra.employee_id
       WHERE ra.project_id = $1 AND ra.company_id = $2
       ORDER BY ra.allocation_percent DESC`,
      [params.projectId, companyId]
    );

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
    const { employee_id, allocation_percent, start_date, end_date, role_in_project, hourly_rate } = body;

    if (!employee_id) return errorResponse('employee_id required', 400);

    const result = await query(
      `INSERT INTO project_resource_allocations (company_id, project_id, employee_id, allocation_percent, start_date, end_date, role_in_project, hourly_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (project_id, employee_id) DO UPDATE SET
         allocation_percent = $4, start_date = $5, end_date = $6, role_in_project = $7, hourly_rate = $8, updated_at = now()
       RETURNING *`,
      [companyId, params.projectId, employee_id, allocation_percent || 100, start_date || null, end_date || null, role_in_project || null, hourly_rate || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(request.url);
    const allocationId = searchParams.get('allocationId');
    if (!allocationId) return errorResponse('allocationId required', 400);

    const result = await query(
      'DELETE FROM project_resource_allocations WHERE id = $1 AND project_id = $2 AND company_id = $3 RETURNING id',
      [allocationId, params.projectId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Allocation not found', 404);

    return successResponse({ message: 'Allocation removed' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

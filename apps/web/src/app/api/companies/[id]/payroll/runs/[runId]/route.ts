import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; runId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: runRows } = await query(
      `SELECT * FROM payroll_runs WHERE id = $1 AND company_id = $2`,
      [params.runId, companyId]
    );
    if (!runRows[0]) return errorResponse('Payroll run not found', 404);

    const { rows: items } = await query(
      `SELECT pi.*, e.first_name, e.last_name, e.rut, e.base_salary
       FROM payroll_items pi
       JOIN employees e ON e.id = pi.employee_id
       WHERE pi.run_id = $1
       ORDER BY e.last_name, e.first_name, pi.category, pi.code`,
      [params.runId]
    );

    return successResponse({ ...runRows[0], items });
  } catch {
    return errorResponse('Failed to fetch payroll run', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; runId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { status, notes, paid_at } = body;

    const validStatuses = ['draft', 'calculated', 'approved', 'paid'];
    if (status && !validStatuses.includes(status)) {
      return errorResponse('Invalid status', 400);
    }

    const { rows } = await query(
      `UPDATE payroll_runs SET
        status = COALESCE($1, status),
        notes = COALESCE($2, notes),
        paid_at = COALESCE($3, paid_at),
        updated_at = NOW()
       WHERE id = $4 AND company_id = $5
       RETURNING *`,
      [status || null, notes || null, paid_at || null, params.runId, companyId]
    );

    if (!rows[0]) return errorResponse('Payroll run not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update payroll run', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; runId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    // Only allow deleting draft runs
    const { rows: existing } = await query(
      `SELECT status FROM payroll_runs WHERE id = $1 AND company_id = $2`,
      [params.runId, companyId]
    );
    if (!existing[0]) return errorResponse('Payroll run not found', 404);
    if (existing[0].status !== 'draft') {
      return errorResponse('Solo se pueden eliminar nomina en estado borrador', 400);
    }

    await query(`DELETE FROM payroll_items WHERE run_id = $1`, [params.runId]);
    await query(`DELETE FROM payroll_runs WHERE id = $1 AND company_id = $2`, [params.runId, companyId]);

    return successResponse({ message: 'Payroll run deleted' });
  } catch {
    return errorResponse('Failed to delete payroll run', 500);
  }
}

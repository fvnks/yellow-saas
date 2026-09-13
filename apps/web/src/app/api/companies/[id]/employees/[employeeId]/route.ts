import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; employeeId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT * FROM employees WHERE id = $1 AND company_id = $2`,
      [params.employeeId, companyId]
    );

    if (!rows[0]) return errorResponse('Empleado no encontrado', 404);

    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to fetch employee', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; employeeId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    const { rows } = await query(
      `UPDATE employees SET
        first_name = $1, last_name = $2, email = $3, phone = $4, address = $5,
        position = $6, department = $7, hire_date = $8, contract_type = $9, base_salary = $10,
        bank_name = $11, bank_account = $12, tax_id = $13,
        notes = $14, status = $15,
        updated_at = NOW()
       WHERE id = $16 AND company_id = $17
       RETURNING *`,
      [
        body.first_name, body.last_name, body.email, body.phone, body.address,
        body.position, body.department, body.hire_date, body.contract_type, body.base_salary,
        body.bank_name, body.bank_account, body.tax_id,
        body.notes, body.status,
        params.employeeId, companyId,
      ]
    );

    if (!rows[0]) return errorResponse('Empleado no encontrado', 404);

    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to update employee', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; employeeId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    await query(
      `DELETE FROM employees WHERE id = $1 AND company_id = $2`,
      [params.employeeId, companyId]
    );

    return successResponse({ message: 'Empleado eliminado' });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Failed to delete employee', 500);
  }
}

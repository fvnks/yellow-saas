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
  } catch {
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
        first_name = $1, last_name = $2, rut = $3, email = $4, phone = $5, address = $6,
        position = $7, department = $8, hire_date = $9, contract_type = $10, base_salary = $11,
        bank_name = $12, bank_account = $13, emergency_contact = $14, emergency_phone = $15,
        notes = $16, status = $17,
        afp_fund = $18, afp_rate = $19, afp_commission = $20,
        health_type = $21, health_amount = $22,
        mutual_type = $23, mutual_rate = $24,
        apv_amount = $25, image_url = $26,
        updated_at = NOW()
       WHERE id = $27 AND company_id = $28
       RETURNING *`,
      [
        body.first_name, body.last_name, body.rut, body.email, body.phone, body.address,
        body.position, body.department, body.hire_date, body.contract_type, body.base_salary,
        body.bank_name, body.bank_account, body.emergency_contact, body.emergency_phone,
        body.notes, body.status,
        body.afp_fund, body.afp_rate, body.afp_commission,
        body.health_type, body.health_amount,
        body.mutual_type, body.mutual_rate,
        body.apv_amount, body.image_url,
        params.employeeId, companyId,
      ]
    );

    if (!rows[0]) return errorResponse('Empleado no encontrado', 404);

    return successResponse(rows[0]);
  } catch {
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
  } catch {
    return errorResponse('Failed to delete employee', 500);
  }
}

import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string; contractId: string } }) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  const body = await request.json();
  const { contract_type, position, department, start_date, end_date, base_salary, status } = body;

  try {
    const result = await query(
      `UPDATE hr_contracts SET contract_type = $1, position = $2, department = $3, start_date = $4, end_date = $5, base_salary = $6, status = $7, updated_at = now()
       WHERE id = $8 AND company_id = $9 RETURNING *`,
      [contract_type, position, department, start_date, end_date || null, base_salary, status, params.contractId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Contrato no encontrado', 404);
    return successResponse(result.rows[0]);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; contractId: string } }) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  try {
    await query('DELETE FROM hr_contracts WHERE id = $1 AND company_id = $2', [params.contractId, companyId]);
    return successResponse({ deleted: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  try {
    const result = await query(
      `SELECT hc.*, e.first_name || ' ' || e.last_name as employee_name, e.rut as employee_rut
       FROM hr_contracts hc
       JOIN employees e ON e.id = hc.employee_id
       WHERE hc.company_id = $1
       ORDER BY hc.created_at DESC`,
      [companyId]
    );
    return successResponse(result.rows);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  const body = await request.json();
  const { employee_id, contract_type, position, department, start_date, end_date, base_salary, status } = body;

  if (!employee_id || !start_date) return errorResponse('employee_id y start_date son requeridos', 400);

  try {
    const result = await query(
      `INSERT INTO hr_contracts (company_id, employee_id, contract_type, position, department, start_date, end_date, base_salary, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [companyId, employee_id, contract_type || 'indefinido', position || null, department || null, start_date, end_date || null, base_salary || 0, status || 'active']
    );
    return successResponse(result.rows[0]);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

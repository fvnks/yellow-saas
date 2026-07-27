import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  try {
    let sql = `SELECT ha.*, e.first_name || ' ' || e.last_name as employee_name, e.rut as employee_rut
       FROM hr_attendance ha
       JOIN employees e ON e.id = ha.employee_id
       WHERE ha.company_id = $1`;
    const params: any[] = [companyId];

    if (date) {
      params.push(date);
      sql += ` AND ha.date = $${params.length}`;
    }

    sql += ' ORDER BY ha.date DESC, ha.check_in DESC';
    const result = await query(sql, params);
    return successResponse(result.rows);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return errorResponse('Company ID not found', 400);

  const body = await request.json();
  const { employee_id, date, check_in, check_out, status, notes } = body;

  if (!employee_id || !date) return errorResponse('employee_id y date son requeridos', 400);

  try {
    const result = await query(
      `INSERT INTO hr_attendance (company_id, employee_id, date, check_in, check_out, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [companyId, employee_id, date, check_in || null, check_out || null, status || 'present', notes || null]
    );
    return successResponse(result.rows[0]);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

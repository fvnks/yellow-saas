import { query } from '@/api/lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
} from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'first_name', 'last_name', 'employee_code', 'email', 'status', 'base_salary', 'id'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const params: any[] = [companyId];
    let where = 'WHERE company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR employee_code ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      where += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) as count FROM employees ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT * FROM employees ${where}
       ORDER BY ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      params
    );

    return paginatedResponse(rows, total, page, limit);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const {
      first_name, last_name, employee_code, email, phone, address,
      birth_date, position, department, hire_date, contract_type, base_salary,
      salary_frequency, bank_name, bank_account, tax_id, afp_id, health_id, notes,
    } = body;

    if (!first_name || !last_name) {
      return errorResponse('Nombre y apellido son obligatorios', 400);
    }

    const { rows } = await query(
      `INSERT INTO employees (
        company_id, first_name, last_name, employee_code, email, phone, address,
        birth_date, position, department, hire_date, contract_type, base_salary,
        salary_frequency, bank_name, bank_account, tax_id, afp_id, health_id, notes, status
       ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, 'active'
       )
       RETURNING *`,
      [
        companyId, first_name, last_name, employee_code || null, email || null, phone || null,
        address || null, birth_date || null, position || null, department || null,
        hire_date || new Date().toISOString().split('T')[0], contract_type || 'indefinite',
        base_salary || 0, salary_frequency || 'monthly', bank_name || null, bank_account || null,
        tax_id || null, afp_id || null, health_id || null, notes || null,
      ]
    );

    return successResponse(rows[0], 201);
  } catch (e: any) {
    if (e?.code === '23505') {
      return errorResponse('Ya existe un empleado con ese RUT en esta empresa', 409);
    }
    return errorResponse('Internal server error', 500);
  }
}

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
    const allowedSortColumns = ['created_at', 'first_name', 'last_name', 'rut', 'email', 'status', 'base_salary', 'id'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const params: any[] = [companyId];
    let where = 'WHERE company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR rut ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
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
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const {
      first_name, last_name, rut, email, phone, address,
      position, department, hire_date, contract_type, base_salary,
      bank_name, bank_account, emergency_contact, emergency_phone, notes,
      afp_fund, afp_rate, afp_commission,
      health_type, health_amount,
      mutual_type, mutual_rate,
      apv_amount, image_url,
    } = body;

    if (!first_name || !last_name || !rut) {
      return errorResponse('Nombre, apellido y RUT son obligatorios', 400);
    }

    const { rows } = await query(
      `INSERT INTO employees (
        company_id, first_name, last_name, rut, email, phone, address,
        position, department, hire_date, contract_type, base_salary,
        bank_name, bank_account, emergency_contact, emergency_phone, notes,
        afp_fund, afp_rate, afp_commission,
        health_type, health_amount,
        mutual_type, mutual_rate,
        apv_amount, image_url, status
       ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20,
        $21, $22,
        $23, $24,
        $25, $26, 'active'
       )
       RETURNING *`,
      [
        companyId, first_name, last_name, rut, email || null, phone || null,
        address || null, position || null, department || null,
        hire_date || new Date().toISOString().split('T')[0], contract_type || 'indefinido',
        base_salary || 0, bank_name || null, bank_account || null,
        emergency_contact || null, emergency_phone || null, notes || null,
        afp_fund || 'AFP Habitat', afp_rate || 10.58, afp_commission || 0.60,
        health_type || 'fonasa', health_amount || 0,
        mutual_type || 'achs', mutual_rate || 0.93,
        apv_amount || 0, image_url || null,
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

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

    const { page, limit, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'start_date', 'status', 'days'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'start_date';
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const employeeId = url.searchParams.get('employee_id');

    const params: any[] = [companyId];
    let where = 'WHERE vr.company_id = $1';
    let paramIndex = 2;

    if (status) {
      where += ` AND vr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (employeeId) {
      where += ` AND vr.employee_id = $${paramIndex}`;
      params.push(employeeId);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) as count FROM vacation_requests vr ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT vr.*,
        e.first_name, e.last_name, e.rut, e.position, e.department
       FROM vacation_requests vr
       JOIN employees e ON e.id = vr.employee_id
       ${where}
       ORDER BY vr.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
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
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { employee_id, start_date, end_date, reason } = body;

    if (!employee_id || !start_date || !end_date) {
      return errorResponse('employee_id, start_date and end_date are required', 400);
    }

    // Calculate days (excluding weekends)
    const start = new Date(start_date);
    const end = new Date(end_date);
    let days = 0;
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }

    if (days <= 0) {
      return errorResponse('El rango de fechas no incluye días hábiles', 400);
    }

    // Check available balance
    const year = start.getFullYear();
    const { rows: balanceRows } = await query(
      `SELECT * FROM vacation_balances
       WHERE company_id = $1 AND employee_id = $2 AND year = $3`,
      [companyId, employee_id, year]
    );

    const balance = balanceRows[0];
    if (!balance) {
      return errorResponse('No hay saldo de vacaciones registrado para este año. Crea el saldo primero.', 400);
    }

    const available = parseFloat(balance.days_available) || 0;
    if (days > available) {
      return errorResponse(`Saldo insuficiente. Disponible: ${available} días, Solicitado: ${days} días`, 400);
    }

    // Create request
    const { rows } = await query(
      `INSERT INTO vacation_requests (company_id, employee_id, start_date, end_date, days, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [companyId, employee_id, start_date, end_date, days, reason || null]
    );

    // Update balance: reserve days
    await query(
      `UPDATE vacation_balances SET
        days_pending = days_pending + $1,
        days_available = days_available - $1,
        updated_at = NOW()
       WHERE company_id = $2 AND employee_id = $3 AND year = $4`,
      [days, companyId, employee_id, year]
    );

    return successResponse(rows[0], 201);
  } catch (e: any) {
    return errorResponse(e?.message || 'Internal server error', 500);
  }
}

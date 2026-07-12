import { query } from '../../../lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
  parseSearchParams,
  paginatedResponse,
  isDemoMode,
  getDemoData,
} from '../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    if (isDemoMode) {
      const { page, limit } = parseSearchParams(request);
      const allData = getDemoData('warehouses');
      const start = (page - 1) * limit;
      const paged = allData.slice(start, start + limit);
      return paginatedResponse(paged, allData.length, page, limit);
    }

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);

    const params: any[] = [companyId];
    let where = 'WHERE w.company_id = $1 AND w.is_active = true';
    let paramIndex = 2;

    if (search) {
      where += ` AND (w.name ILIKE $${paramIndex} OR w.code ILIKE $${paramIndex} OR w.city ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) as count FROM warehouses w ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT w.*,
        (SELECT COUNT(*) FROM stock_levels sl WHERE sl.warehouse_id = w.id) as total_products,
        (SELECT COALESCE(SUM(sl.quantity), 0) FROM stock_levels sl WHERE sl.warehouse_id = w.id) as total_stock_value
       FROM warehouses w
       ${where}
       ORDER BY w.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
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

    if (isDemoMode) {
      return successResponse({ id: crypto.randomUUID(), ...body, created_at: new Date().toISOString() }, 201);
    }

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { name, code, address, city, region, country, phone, email, is_default } = body;

    if (!name || !code) {
      return errorResponse('Name and code are required', 400);
    }

    if (is_default) {
      await query(
        `UPDATE warehouses SET is_default = false WHERE company_id = $1 AND is_default = true`,
        [companyId]
      );
    }

    const { rows } = await query(
      `INSERT INTO warehouses (company_id, name, code, address, city, region, country, phone, email, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        companyId, name, code, address || null, city || null, region || null,
        country || 'CL', phone || null, email || null, is_default || false,
      ]
    );

    return successResponse(rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'name', 'code', 'trade_name', 'tax_id', 'email', 'phone', 'id'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';

    let whereClause = 'WHERE company_id = $1 AND is_active = true';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR trade_name ILIKE $${paramIndex} OR tax_id ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM customers ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT * FROM customers ${whereClause}
       ORDER BY ${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
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
      name, code, trade_name, tax_id, tax_id_type, address, city, region,
      country, postal_code, phone, email, website, contact_person,
      contact_phone, contact_email, payment_terms, credit_limit, price_list_id,
      tax_exempt, notes,
    } = body;

    if (!name) {
      return errorResponse('Name is required', 400);
    }

    if (tax_id) {
      const existing = await query(
        'SELECT id FROM customers WHERE company_id = $1 AND tax_id = $2',
        [companyId, tax_id]
      );
      if (existing.rows.length > 0) {
        return errorResponse(`Ya existe un cliente con este RUT: ${tax_id}`, 409);
      }
    }

    const result = await query(
      `INSERT INTO customers (
        company_id, name, code, trade_name, tax_id, tax_id_type, address, city, region,
        country, postal_code, phone, email, website, contact_person,
        contact_phone, contact_email, payment_terms, credit_limit, price_list_id,
        tax_exempt, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`,
      [companyId, name, code || null, trade_name || null, tax_id || null, tax_id_type || 'RUT',
       address || null, city || null, region || null, country || 'CL', postal_code || null,
       phone || null, email || null, website || null, contact_person || null,
       contact_phone || null, contact_email || null, payment_terms || 0, credit_limit || 0,
       price_list_id || null, tax_exempt || false, notes || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

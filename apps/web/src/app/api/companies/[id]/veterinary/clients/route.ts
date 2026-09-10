import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);

    let where = 'WHERE company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      where += ` AND (full_name ILIKE $${paramIndex} OR rut ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const allowedSort = ['created_at', 'full_name', 'rut'];
    const sortColumn = allowedSort.includes(requestedSort) ? requestedSort : 'created_at';

    const { rows } = await query(
      `SELECT * FROM veterinary_clients ${where}
       ORDER BY ${sortColumn} ${order === 'desc' ? 'DESC' : 'ASC'}
       OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      [...params, offset, limit]
    );

    const { rows: countRows } = await query(`SELECT COUNT(*) FROM veterinary_clients ${where}`, params);
    const total = parseInt(countRows[0]?.count || '0');

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
    const {
      customer_id, full_name, rut, phone, email, address, commune, city,
      secondary_contact_name, secondary_contact_phone, notes, status
    } = body;

    if (!full_name) return errorResponse('Full name is required', 400);

    if (rut) {
      const existing = await query(
        `SELECT id FROM veterinary_clients WHERE company_id = $1 AND LOWER(rut) = LOWER($2)`,
        [companyId, rut]
      );
      if (existing.rows.length > 0) {
        return errorResponse('A client with this RUT already exists', 409);
      }
    }

    const result = await query(
      `INSERT INTO veterinary_clients (company_id, customer_id, full_name, rut, phone, email, address, commune, city, secondary_contact_name, secondary_contact_phone, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        companyId, customer_id || null, full_name, rut || null, phone || null, email || null,
        address || null, commune || null, city || null, secondary_contact_name || null,
        secondary_contact_phone || null, notes || null, status || 'active'
      ]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

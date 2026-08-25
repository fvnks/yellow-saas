import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

const allowedStatus = ['pagada', 'confirming', 'factoring'];
const allowedSellers = ['FELIPE', 'MACA'];
const allowedSortColumns = ['emission_date', 'total_amount', 'client', 'invoice_number', 'status', 'seller', 'created_at'];

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort, order, offset } = parseSearchParams(request);

    let whereClause = 'WHERE sr.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (sr.client ILIKE $${paramIndex} OR sr.invoice_number ILIKE $${paramIndex} OR sr.guide_number ILIKE $${paramIndex} OR sr.seller ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const statusFilter = request.nextUrl.searchParams.get('status');
    if (statusFilter && allowedStatus.includes(statusFilter)) {
      whereClause += ` AND sr.status = $${paramIndex}`;
      params.push(statusFilter);
      paramIndex++;
    }

    const sellerFilter = request.nextUrl.searchParams.get('seller');
    if (sellerFilter && allowedSellers.includes(sellerFilter)) {
      whereClause += ` AND sr.seller = $${paramIndex}`;
      params.push(sellerFilter);
      paramIndex++;
    }

    const sortBy = allowedSortColumns.includes(sort || '') ? sort : 'emission_date';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const countResult = await query(
      `SELECT COUNT(*) FROM sales_registers sr ${whereClause}`,
      params
    );

    const dataResult = await query(
      `SELECT sr.* FROM sales_registers sr ${whereClause} ORDER BY sr.${sortBy} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { client, invoice_number, emission_date, status, payment_date, net_amount, total_amount, guide_number, seller, notes } = body;

    if (!client) return errorResponse('Client is required', 400);
    if (!invoice_number) return errorResponse('Invoice number is required', 400);
    if (!seller) return errorResponse('Seller is required', 400);
    if (!allowedSellers.includes(seller)) return errorResponse('Seller must be FELIPE or MACA', 400);
    if (status && !allowedStatus.includes(status)) return errorResponse('Invalid status', 400);

    const existing = await query(
      `SELECT id FROM sales_registers WHERE company_id = $1 AND invoice_number = $2`,
      [companyId, invoice_number]
    );
    if (existing.rows.length > 0) {
      return errorResponse('An invoice with this number already exists', 400);
    }

    const result = await query(
      `INSERT INTO sales_registers (company_id, client, invoice_number, emission_date, status, payment_date, net_amount, total_amount, guide_number, seller, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [companyId, client, invoice_number, emission_date || new Date().toISOString().split('T')[0], status || 'pagada', payment_date || null, net_amount || 0, total_amount || 0, guide_number || null, seller, notes || null]
    );

    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

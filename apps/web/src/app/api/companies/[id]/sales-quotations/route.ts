import { query, transaction } from '@/api/lib/db';
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
    const allowedSortColumns = ['created_at', 'quotation_number', 'status', 'id'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'created_at';
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const customer = url.searchParams.get('customer');

    const params: any[] = [companyId];
    let where = 'WHERE sq.company_id = $1';
    let paramIndex = 2;

    if (search) {
      where += ` AND sq.quotation_number ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      where += ` AND sq.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (customer) {
      where += ` AND sq.customer_id = $${paramIndex}`;
      params.push(customer);
      paramIndex++;
    }

    const countResult = await query(`SELECT COUNT(*) as count FROM sales_quotations sq ${where}`, params);
    const total = parseInt(countResult.rows[0]?.count || '0');

    params.push(offset, limit);
    const { rows } = await query(
      `SELECT sq.*,
        (SELECT json_build_object('id', c.id, 'name', c.name, 'tax_id', c.tax_id) FROM customers c WHERE c.id = sq.customer_id) as customer,
        (SELECT COUNT(*)::int FROM sales_quotation_items sqi WHERE sqi.quotation_id = sq.id) as item_count,
        (SELECT COALESCE(SUM(sqi.line_total), 0) FROM sales_quotation_items sqi WHERE sqi.quotation_id = sq.id) as total
       FROM sales_quotations sq
       ${where}
       ORDER BY sq.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
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

    const { customer_id, valid_until, notes, items } = body;

    if (!customer_id || !items?.length) {
      return errorResponse('Customer and items are required', 400);
    }

    const result = await transaction(async (client) => {
      const { rows: countRows } = await client.query(
        `SELECT COUNT(*) as count FROM sales_quotations WHERE company_id = $1`,
        [companyId]
      );
      const year = new Date().getFullYear();
      const quotationNumber = `COT-${year}-${String((parseInt(countRows[0]?.count || '0') + 1)).padStart(5, '0')}`;

      const { rows: quotationRows } = await client.query(
        `INSERT INTO sales_quotations (company_id, customer_id, quotation_number, status, valid_until, notes)
         VALUES ($1, $2, $3, 'draft', $4, $5)
         RETURNING *`,
        [companyId, customer_id, quotationNumber, valid_until || null, notes || null]
      );

      const quotation = quotationRows[0];

      for (const item of items) {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        await client.query(
          `INSERT INTO sales_quotation_items (quotation_id, company_id, product_id, quantity, unit_price, discount_percent, tax_rate)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            quotation.id, companyId, item.product_id,
            quantity, unitPrice,
            item.discount_percent || 0, item.tax_rate || 19,
          ]
        );
      }

      return quotation;
    });

    return successResponse(result, 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

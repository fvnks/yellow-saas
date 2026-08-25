import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; quotationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT sq.*,
        (SELECT json_build_object('id', c.id, 'name', c.name, 'tax_id', c.tax_id) FROM customers c WHERE c.id = sq.customer_id) as customer,
        (SELECT json_agg(json_build_object(
          'id', sqi.id, 'product_id', sqi.product_id, 'quantity', sqi.quantity,
          'unit_price', sqi.unit_price, 'discount_percent', sqi.discount_percent,
          'tax_rate', sqi.tax_rate, 'line_total', sqi.line_total,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku) FROM products p WHERE p.id = sqi.product_id)
        )) FROM sales_quotation_items sqi WHERE sqi.quotation_id = sq.id) as items
       FROM sales_quotations sq
       WHERE sq.id = $1 AND sq.company_id = $2`,
      [params.quotationId, companyId]
    );

    if (!rows[0]) return errorResponse('Sales quotation not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch sales quotation', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; quotationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    const { rows } = await query(
      `UPDATE sales_quotations SET
        status = $1, customer_id = $2, valid_until = $3, notes = $4,
        updated_at = NOW()
       WHERE id = $5 AND company_id = $6
       RETURNING *`,
      [
        body.status, body.customer_id, body.valid_until, body.notes,
        params.quotationId, companyId,
      ]
    );

    if (!rows[0]) return errorResponse('Sales quotation not found', 404);

    if (body.items?.length) {
      await query(`DELETE FROM sales_quotation_items WHERE quotation_id = $1 AND company_id = $2`, [
        params.quotationId, companyId,
      ]);

      for (const item of body.items) {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        await query(
          `INSERT INTO sales_quotation_items (quotation_id, company_id, product_id, quantity, unit_price, discount_percent, tax_rate)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            params.quotationId, companyId, item.product_id,
            quantity, unitPrice,
            item.discount_percent || 0, item.tax_rate || 19,
          ]
        );
      }
    }

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update sales quotation', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; quotationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: quotation } = await query(
      `SELECT status FROM sales_quotations WHERE id = $1 AND company_id = $2`,
      [params.quotationId, companyId]
    );

    if (!quotation[0]) return errorResponse('Sales quotation not found', 404);

    if (quotation[0].status !== 'draft') {
      return errorResponse('Only draft quotations can be deleted', 400);
    }

    await query(`DELETE FROM sales_quotation_items WHERE quotation_id = $1 AND company_id = $2`, [params.quotationId, companyId]);
    await query(`DELETE FROM sales_quotations WHERE id = $1 AND company_id = $2`, [params.quotationId, companyId]);

    return successResponse({ message: 'Sales quotation deleted successfully' });
  } catch {
    return errorResponse('Failed to delete sales quotation', 500);
  }
}

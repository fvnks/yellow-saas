import { query } from '../../../../lib/db';
import {
  getCompanyId,
  successResponse,
  errorResponse,
} from '../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string; quotationId: string } }) {
  try {
    const { quotationId } = params;

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT q.*,
        (SELECT json_build_object('id', s.id, 'name', s.name, 'tax_id', s.tax_id, 'email', s.email, 'phone', s.phone) FROM suppliers s WHERE s.id = q.supplier_id) as supplier,
        (SELECT json_agg(json_build_object(
          'id', qi.id, 'product_id', qi.product_id, 'quantity', qi.quantity, 'unit_price', qi.unit_price,
          'discount_percent', qi.discount_percent, 'discount_amount', qi.discount_amount,
          'tax_rate', qi.tax_rate, 'tax_amount', qi.tax_amount, 'line_total', qi.line_total,
          'notes', qi.notes, 'sort_order', qi.sort_order,
          'product', (SELECT json_build_object('id', p.id, 'name', p.name, 'sku', p.sku, 'unit', p.unit) FROM products p WHERE p.id = qi.product_id)
        )) FROM quotation_items qi WHERE qi.quotation_id = q.id) as items
       FROM quotations q
       WHERE q.id = $1 AND q.company_id = $2`,
      [quotationId, companyId]
    );

    if (!rows[0]) return errorResponse('Quotation not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; quotationId: string } }) {
  try {
    const { quotationId } = params;
    const body = await request.json();

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const {
      supplier_id, quote_date, expiry_date, valid_until,
      status, payment_terms, delivery_terms, notes, internal_notes, items,
    } = body;

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (supplier_id !== undefined) { updateFields.push(`supplier_id = $${paramIndex++}`); updateValues.push(supplier_id); }
    if (quote_date !== undefined) { updateFields.push(`quote_date = $${paramIndex++}`); updateValues.push(quote_date); }
    if (expiry_date !== undefined) { updateFields.push(`expiry_date = $${paramIndex++}`); updateValues.push(expiry_date); }
    if (valid_until !== undefined) { updateFields.push(`valid_until = $${paramIndex++}`); updateValues.push(valid_until); }
    if (status !== undefined) { updateFields.push(`status = $${paramIndex++}`); updateValues.push(status); }
    if (payment_terms !== undefined) { updateFields.push(`payment_terms = $${paramIndex++}`); updateValues.push(payment_terms); }
    if (delivery_terms !== undefined) { updateFields.push(`delivery_terms = $${paramIndex++}`); updateValues.push(delivery_terms); }
    if (notes !== undefined) { updateFields.push(`notes = $${paramIndex++}`); updateValues.push(notes); }
    if (internal_notes !== undefined) { updateFields.push(`internal_notes = $${paramIndex++}`); updateValues.push(internal_notes); }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(quotationId, companyId);

    const { rows: quotationRows } = await query(
      `UPDATE quotations SET ${updateFields.join(', ')} WHERE id = $${paramIndex++} AND company_id = $${paramIndex++} RETURNING *`,
      updateValues
    );

    const quotation = quotationRows[0];
    if (!quotation) return errorResponse('Quotation not found', 404);

    if (items && Array.isArray(items)) {
      await query(`DELETE FROM quotation_items WHERE quotation_id = $1`, [quotationId]);

      const quotationItems = items.map((item: Record<string, unknown>, index: number) => {
        const taxRate = Number(item.tax_rate) || 0;
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        const discountAmount = Number(item.discount_amount) || 0;
        return {
          quotation_id: quotationId,
          company_id: companyId,
          product_id: item.product_id,
          quantity,
          unit_price: unitPrice,
          discount_percent: item.discount_percent || 0,
          discount_amount: discountAmount,
          tax_rate: taxRate,
          tax_amount: taxRate > 0 ? (quantity * unitPrice - discountAmount) * (taxRate / 100) : 0,
          notes: item.notes || null,
          sort_order: index,
        };
      });

      for (const qi of quotationItems) {
        await query(
          `INSERT INTO quotation_items (quotation_id, company_id, product_id, quantity, unit_price, discount_percent, discount_amount, tax_rate, tax_amount, notes, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [qi.quotation_id, qi.company_id, qi.product_id, qi.quantity, qi.unit_price,
           qi.discount_percent, qi.discount_amount, qi.tax_rate, qi.tax_amount, qi.notes, qi.sort_order]
        );
      }

      return successResponse({ ...quotation, items: quotationItems });
    }

    return successResponse(quotation);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; quotationId: string } }) {
  try {
    const { quotationId } = params;

    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    await query(`DELETE FROM quotation_items WHERE quotation_id = $1 AND company_id = $2`, [quotationId, companyId]);
    await query(`DELETE FROM quotations WHERE id = $1 AND company_id = $2`, [quotationId, companyId]);

    return successResponse({ id: quotationId, deleted: true });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
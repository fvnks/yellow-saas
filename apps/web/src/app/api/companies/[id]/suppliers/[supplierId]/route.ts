import { query } from '../../../../lib/db';
import { getCompanyId, successResponse, errorResponse } from '../../../../lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; supplierId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT * FROM suppliers WHERE id = $1 AND company_id = $2`,
      [params.supplierId, companyId]
    );

    if (!rows[0]) return errorResponse('Supplier not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch supplier', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; supplierId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();

    const { rows } = await query(
      `UPDATE suppliers SET
        name = $1, code = $2, trade_name = $3, tax_id = $4, tax_id_type = $5,
        address = $6, city = $7, region = $8, country = $9, postal_code = $10,
        phone = $11, email = $12, website = $13, contact_person = $14,
        contact_phone = $15, contact_email = $16, payment_terms = $17,
        credit_limit = $18, currency = $19, notes = $20, is_active = $21,
        updated_at = NOW()
       WHERE id = $22 AND company_id = $23
       RETURNING *`,
      [
        body.name, body.code, body.trade_name, body.tax_id, body.tax_id_type,
        body.address, body.city, body.region, body.country, body.postal_code,
        body.phone, body.email, body.website, body.contact_person,
        body.contact_phone, body.contact_email, body.payment_terms,
        body.credit_limit, body.currency, body.notes, body.is_active,
        params.supplierId, companyId,
      ]
    );

    if (!rows[0]) return errorResponse('Supplier not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update supplier', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; supplierId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: orders } = await query(
      `SELECT id FROM purchase_orders WHERE supplier_id = $1 AND company_id = $2 LIMIT 1`,
      [params.supplierId, companyId]
    );

    if (orders.length > 0) {
      return errorResponse('Cannot delete supplier with existing purchase orders', 400);
    }

    await query(
      `DELETE FROM suppliers WHERE id = $1 AND company_id = $2`,
      [params.supplierId, companyId]
    );

    return successResponse({ message: 'Supplier deleted successfully' });
  } catch {
    return errorResponse('Failed to delete supplier', 500);
  }
}

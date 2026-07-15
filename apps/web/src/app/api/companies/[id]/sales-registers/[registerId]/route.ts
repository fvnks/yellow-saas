import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

const allowedStatus = ['pagada', 'confirming', 'factoring'];
const allowedSellers = ['FELIPE', 'MACA'];

export async function GET(request: NextRequest, { params }: { params: { id: string; registerId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `SELECT * FROM sales_registers WHERE company_id = $1 AND id = $2`,
      [companyId, params.registerId]
    );

    if (result.rows.length === 0) return errorResponse('Record not found', 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; registerId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { client, invoice_number, emission_date, status, payment_date, net_amount, total_amount, guide_number, seller, notes } = body;

    if (status && !allowedStatus.includes(status)) return errorResponse('Invalid status', 400);
    if (seller && !allowedSellers.includes(seller)) return errorResponse('Seller must be FELIPE or MACA', 400);

    const result = await query(
      `UPDATE sales_registers SET
        client = COALESCE($1, client),
        invoice_number = COALESCE($2, invoice_number),
        emission_date = COALESCE($3, emission_date),
        status = COALESCE($4, status),
        payment_date = $5,
        net_amount = COALESCE($6, net_amount),
        total_amount = COALESCE($7, total_amount),
        guide_number = $8,
        seller = COALESCE($9, seller),
        notes = $10,
        updated_at = now()
       WHERE company_id = $11 AND id = $12
       RETURNING *`,
      [client, invoice_number, emission_date, status, payment_date, net_amount, total_amount, guide_number, seller, notes, companyId, params.registerId]
    );

    if (result.rows.length === 0) return errorResponse('Record not found', 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; registerId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(
      `DELETE FROM sales_registers WHERE company_id = $1 AND id = $2 RETURNING id`,
      [companyId, params.registerId]
    );

    if (result.rows.length === 0) return errorResponse('Record not found', 404);
    return successResponse({ message: 'Record deleted' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}

import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string; noteId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: note } = await query(
      `SELECT dn.*, c.name as customer_name, c.tax_id as customer_rut, c.address as customer_address, c.city as customer_city,
        i.invoice_number, i.total_amount as invoice_total
       FROM debit_notes dn
       JOIN customers c ON c.id = dn.customer_id
       LEFT JOIN invoices i ON i.id = dn.invoice_id
       WHERE dn.id = $1 AND dn.company_id = $2`,
      [params.noteId, companyId]
    );

    if (note.length === 0) return errorResponse('Debit note not found', 404);

    const { rows: items } = await query(
      `SELECT dni.*, p.name as product_name, p.sku
       FROM debit_note_items dni
       LEFT JOIN products p ON p.id = dni.product_id
       WHERE dni.debit_note_id = $1`,
      [params.noteId]
    );

    return successResponse({ ...note[0], items });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string; noteId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { status, notes } = body;

    const fields: string[] = ['updated_at = NOW()'];
    const values: any[] = [];
    let idx = 3;

    if (status) { fields.push(`status = $${idx}`); values.push(status); idx++; }
    if (notes !== undefined) { fields.push(`notes = $${idx}`); values.push(notes); idx++; }

    const { rows } = await query(
      `UPDATE debit_notes SET ${fields.join(', ')}
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [params.noteId, companyId, ...values]
    );

    if (rows.length === 0) return errorResponse('Not found', 404);
    return successResponse(rows[0]);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; noteId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    await query('DELETE FROM debit_note_items WHERE debit_note_id = $1 AND company_id = $2', [params.noteId, companyId]);
    await query('DELETE FROM debit_notes WHERE id = $1 AND company_id = $2', [params.noteId, companyId]);
    return successResponse({ deleted: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

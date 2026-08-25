import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows: notes } = await query(
      `SELECT pcn.*, s.name as supplier_name, s.tax_id as supplier_tax_id
       FROM purchase_credit_notes pcn
       JOIN suppliers s ON s.id = pcn.supplier_id
       WHERE pcn.company_id = $1
       ORDER BY pcn.created_at DESC`,
      [companyId]
    );

    return successResponse(notes);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { supplier_id, note_number, issue_date, reason, purchase_invoice_id, notes, items } = body;

    if (!supplier_id) return errorResponse('supplier_id es requerido', 400);

    const totalAmount = (items || []).reduce((sum: number, i: any) => sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.unit_price) || 0), 0);

    const { rows } = await query(
      `INSERT INTO purchase_credit_notes (company_id, supplier_id, note_number, issue_date, total_amount, reason, purchase_invoice_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [companyId, supplier_id, note_number || `NC-P-${Date.now().toString(36).toUpperCase()}`, issue_date || new Date().toISOString().split('T')[0], totalAmount, reason || null, purchase_invoice_id || null, notes || null]
    );

    const noteId = rows[0].id;
    for (const item of (items || [])) {
      await query(
        `INSERT INTO purchase_credit_note_items (company_id, note_id, product_id, description, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [companyId, noteId, item.product_id || null, item.description || null, item.quantity || 1, item.unit_price || 0, (item.quantity || 1) * (item.unit_price || 0)]
      );
    }

    return successResponse(rows[0], 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

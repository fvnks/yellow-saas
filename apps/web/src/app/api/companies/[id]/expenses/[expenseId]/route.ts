import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string; expenseId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(`
      SELECT e.*, ec.name as category_name, ec.color as category_color,
             cc.name as cost_center_name, cc.code as cost_center_code
      FROM expenses e
      LEFT JOIN expense_categories ec ON ec.id = e.category_id
      LEFT JOIN cost_centers cc ON cc.id = e.cost_center_id
      WHERE e.id = $1 AND e.company_id = $2
    `, [params.expenseId, companyId]);

    if (result.rows.length === 0) return errorResponse('Gasto no encontrado', 404);
    return successResponse({ data: result.rows[0] });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; expenseId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fields = ['expense_date', 'amount', 'tax_amount', 'category_id', 'supplier_name',
      'supplier_rut', 'document_type', 'document_number', 'description', 'notes', 'cost_center_id', 'status'];
    for (const field of fields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = $${paramIndex++}`);
        values.push(body[field]);
      }
    }
    setClauses.push('updated_at = now()');
    values.push(params.expenseId, companyId);

    const result = await query(`
      UPDATE expenses SET ${setClauses.join(', ')} WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
      RETURNING *
    `, values);

    if (result.rows.length === 0) return errorResponse('Gasto no encontrado', 404);
    return successResponse({ data: result.rows[0] });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; expenseId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query('DELETE FROM expenses WHERE id = $1 AND company_id = $2', [params.expenseId, companyId]);
    if (result.rowCount === 0) return errorResponse('Gasto no encontrado', 404);
    return successResponse({ message: 'Gasto eliminado' });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

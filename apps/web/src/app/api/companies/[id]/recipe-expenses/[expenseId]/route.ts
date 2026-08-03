import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function GET(request: NextRequest, { params }: { params: { id: string; expenseId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT re.*,
        (SELECT json_build_object('id', f.id, 'name', f.name) FROM formulas f WHERE f.id = re.formula_id) as formula
       FROM recipe_expenses re
       WHERE re.id = $1 AND re.company_id = $2`,
      [params.expenseId, companyId]
    );

    if (rows.length === 0) return errorResponse('Gasto no encontrado', 404);
    return successResponse(rows[0]);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; expenseId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { formula_id, category, description, amount, expense_date, is_recurring, recurring_period, notes } = body;

    const { rows } = await query(
      `UPDATE recipe_expenses
       SET formula_id = $3, category = $4, description = $5, amount = $6,
           expense_date = $7, is_recurring = $8, recurring_period = $9, notes = $10,
           updated_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [
        params.expenseId, companyId,
        formula_id || null, category, description, amount,
        expense_date, is_recurring || false, recurring_period || null, notes || null,
      ]
    );

    if (rows.length === 0) return errorResponse('Gasto no encontrado', 404);
    return successResponse(rows[0]);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; expenseId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rowCount } = await query(
      'DELETE FROM recipe_expenses WHERE id = $1 AND company_id = $2',
      [params.expenseId, companyId]
    );

    if (rowCount === 0) return errorResponse('Gasto no encontrado', 404);
    return successResponse({ deleted: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

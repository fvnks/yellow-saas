import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string; categoryId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;
    const fields = ['name', 'color', 'tax_deductible', 'is_active'];
    for (const f of fields) {
      if (body[f] !== undefined) {
        setClauses.push(`${f} = $${idx++}`);
        values.push(body[f]);
      }
    }
    // Update slug if name changed
    if (body.name) {
      const slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setClauses.push(`slug = $${idx++}`);
      values.push(slug);
    }
    setClauses.push('updated_at = now()');
    values.push(params.categoryId, companyId);

    const result = await query(`UPDATE expense_categories SET ${setClauses.join(', ')} WHERE id = $${idx} AND company_id = $${idx + 1} RETURNING *`, values);
    if (result.rows.length === 0) return errorResponse('Categoría no encontrada', 404);
    return successResponse({ data: result.rows[0] });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; categoryId: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query('DELETE FROM expense_categories WHERE id = $1 AND company_id = $2', [params.categoryId, companyId]);
    if (result.rowCount === 0) return errorResponse('Categoría no encontrada', 404);
    return successResponse({ message: 'Categoría eliminada' });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const result = await query(`
      SELECT * FROM expense_categories WHERE company_id = $1 AND is_active = true ORDER BY name
    `, [companyId]);
    return successResponse({ data: result.rows });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, color, tax_deductible, parent_id } = body;

    if (!name) return errorResponse('El nombre es requerido', 400);

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const result = await query(`
      INSERT INTO expense_categories (company_id, name, slug, color, tax_deductible, parent_id)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [companyId, name, slug, color || '#6B7280', tax_deductible || false, parent_id || null]);

    return successResponse({ data: result.rows[0] }, 201);
  } catch (e: any) {
    if (e.message.includes('unique')) {
      return errorResponse('Ya existe una categoría con ese nombre', 409);
    }
    return errorResponse(e.message, 500);
  }
}

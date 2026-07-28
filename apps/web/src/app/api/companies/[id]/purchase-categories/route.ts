import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT pc.*, cc.name as cost_center_name, cc.code as cost_center_code
       FROM purchase_categories pc
       LEFT JOIN cost_centers cc ON cc.id = pc.cost_center_id
       WHERE pc.company_id = $1
       ORDER BY pc.is_default DESC, pc.name ASC`,
      [companyId]
    );

    return successResponse(rows);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { name, description, cost_center_id } = body;

    if (!name) return errorResponse('name es requerido', 400);

    const { rows } = await query(
      `INSERT INTO purchase_categories (company_id, name, description, cost_center_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [companyId, name, description || null, cost_center_id || null]
    );

    return successResponse(rows[0], 201);
  } catch (e: any) {
    if (e.message.includes('unique')) {
      return errorResponse('Ya existe una categoría con ese nombre', 409);
    }
    return errorResponse(e.message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { id, name, description, cost_center_id } = body;

    if (!id) return errorResponse('id es requerido', 400);

    const { rows } = await query(
      `UPDATE purchase_categories
       SET name = COALESCE($3, name), description = $4, cost_center_id = $5, updated_at = now()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [id, companyId, name, description || null, cost_center_id || null]
    );

    if (rows.length === 0) return errorResponse('Categoría no encontrada', 404);
    return successResponse(rows[0]);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) return errorResponse('id es requerido', 400);

    const { rowCount } = await query(
      `DELETE FROM purchase_categories WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );

    if (rowCount === 0) return errorResponse('Categoría no encontrada', 404);
    return successResponse({ deleted: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

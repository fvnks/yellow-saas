import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT * FROM payment_methods
       WHERE company_id = $1
       ORDER BY is_default DESC, name ASC`,
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
    const { name, description } = body;

    if (!name) return errorResponse('name es requerido', 400);

    const { rows } = await query(
      `INSERT INTO payment_methods (company_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [companyId, name, description || null]
    );

    return successResponse(rows[0], 201);
  } catch (e: any) {
    if (e.message.includes('unique')) {
      return errorResponse('Ya existe una forma de pago con ese nombre', 409);
    }
    return errorResponse(e.message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await req.json();
    const { id, name, description } = body;

    if (!id) return errorResponse('id es requerido', 400);

    const { rows } = await query(
      `UPDATE payment_methods
       SET name = COALESCE($3, name), description = $4, updated_at = now()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [id, companyId, name, description || null]
    );

    if (rows.length === 0) return errorResponse('Forma de pago no encontrada', 404);
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
      `DELETE FROM payment_methods WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );

    if (rowCount === 0) return errorResponse('Forma de pago no encontrada', 404);
    return successResponse({ deleted: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

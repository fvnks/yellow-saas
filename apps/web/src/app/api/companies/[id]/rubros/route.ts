import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '200');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await query(
      `SELECT r.*,
        (SELECT COUNT(*) FROM customers c WHERE c.rubro_id = r.id) as customer_count
       FROM company_rubros r
       WHERE r.company_id = $1
       ORDER BY r.name ASC
       LIMIT $2 OFFSET $3`,
      [companyId, limit, offset]
    );

    return successResponse(result.rows);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { name, description } = body;

    if (!name) return errorResponse('Nombre es requerido', 400);

    const existing = await query(
      'SELECT id FROM company_rubros WHERE company_id = $1 AND name = $2',
      [companyId, name]
    );
    if (existing.rows.length > 0) {
      return errorResponse('Ya existe un rubro con ese nombre', 400);
    }

    const result = await query(
      `INSERT INTO company_rubros (company_id, name, description)
       VALUES ($1, $2, $3) RETURNING *`,
      [companyId, name, description || null]
    );

    return successResponse(result.rows[0]);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { id, name, description, is_active } = body;

    if (!id) return errorResponse('ID es requerido', 400);

    if (name) {
      const existing = await query(
        'SELECT id FROM company_rubros WHERE company_id = $1 AND name = $2 AND id != $3',
        [companyId, name, id]
      );
      if (existing.rows.length > 0) {
        return errorResponse('Ya existe un rubro con ese nombre', 400);
      }
    }

    const result = await query(
      `UPDATE company_rubros
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           is_active = COALESCE($3, is_active),
           updated_at = now()
       WHERE id = $4 AND company_id = $5 RETURNING *`,
      [name, description, is_active, id, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Rubro no encontrado', 404);
    return successResponse(result.rows[0]);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('ID es requerido', 400);

    const customerCheck = await query(
      'SELECT COUNT(*) as count FROM customers WHERE rubro_id = $1 AND company_id = $2',
      [id, companyId]
    );
    if (parseInt(customerCheck.rows[0].count) > 0) {
      return errorResponse('No se puede eliminar — tiene clientes asignados', 400);
    }

    const result = await query(
      'DELETE FROM company_rubros WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Rubro no encontrado', 404);
    return successResponse({ deleted: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

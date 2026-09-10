import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function GET(req: NextRequest, { params }: { params: { id: string; tokenId: string } }) {
  try {
    const companyId = getCompanyId(req);
    const result = await query(
      `SELECT pt.*, p.name as patient_name, p.species, p.breed,
              c.full_name as client_name, c.rut as client_rut
       FROM veterinary_portal_tokens pt
       LEFT JOIN veterinary_patients p ON p.id = pt.patient_id
       LEFT JOIN veterinary_clients c ON c.id = pt.client_id
       WHERE pt.id = $1 AND pt.company_id = $2`,
      [params.tokenId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Token no encontrado', 404);
    return successResponse(result.rows[0]);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al obtener token', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string; tokenId: string } }) {
  try {
    const companyId = getCompanyId(req);
    const body = await req.json();
    const { is_active, expires_at } = body;

    const result = await query(
      `UPDATE veterinary_portal_tokens
       SET is_active = COALESCE($1, is_active), expires_at = COALESCE($2, expires_at), updated_at = now()
       WHERE id = $3 AND company_id = $4
       RETURNING *`,
      [is_active, expires_at, params.tokenId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Token no encontrado', 404);
    return successResponse(result.rows[0]);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al actualizar token', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; tokenId: string } }) {
  try {
    const companyId = getCompanyId(req);
    const result = await query(
      'DELETE FROM veterinary_portal_tokens WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.tokenId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Token no encontrado', 404);
    return successResponse({ deleted: true });
  } catch (error: any) {
    return errorResponse(error.message || 'Error al eliminar token', 500);
  }
}

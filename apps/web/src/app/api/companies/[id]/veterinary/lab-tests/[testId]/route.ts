import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function GET(req: NextRequest, { params }: { params: { id: string; testId: string } }) {
  try {
    const companyId = getCompanyId(req);
    const result = await query(
      `SELECT lt.*, lp.name as panel_name
       FROM veterinary_lab_tests lt
       LEFT JOIN veterinary_lab_panels lp ON lp.id = lt.panel_id AND lp.company_id = lt.company_id
       WHERE lt.id = $1 AND lt.company_id = $2`,
      [params.testId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Examen no encontrado', 404);
    return successResponse(result.rows[0]);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al obtener examen', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string; testId: string } }) {
  try {
    const companyId = getCompanyId(req);
    const body = await req.json();
    const { name, code, unit, reference_range, reference_range_feline, reference_range_avian, sort_order } = body;

    const result = await query(
      `UPDATE veterinary_lab_tests
       SET name = COALESCE($1, name), code = COALESCE($2, code), unit = COALESCE($3, unit),
           reference_range = COALESCE($4, reference_range), reference_range_feline = COALESCE($5, reference_range_feline),
           reference_range_avian = COALESCE($6, reference_range_avian), sort_order = COALESCE($7, sort_order),
           updated_at = now()
       WHERE id = $8 AND company_id = $9
       RETURNING *`,
      [name, code, unit, reference_range, reference_range_feline, reference_range_avian, sort_order, params.testId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Examen no encontrado', 404);
    return successResponse(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') return errorResponse('Código duplicado en este panel', 409);
    return errorResponse(error.message || 'Error al actualizar examen', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; testId: string } }) {
  try {
    const companyId = getCompanyId(req);
    const result = await query(
      'DELETE FROM veterinary_lab_tests WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.testId, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Examen no encontrado', 404);
    return successResponse({ deleted: true });
  } catch (error: any) {
    return errorResponse(error.message || 'Error al eliminar examen', 500);
  }
}

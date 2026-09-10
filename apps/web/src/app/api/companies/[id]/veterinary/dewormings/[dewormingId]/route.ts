import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; dewormingId: string } }
) {
  try {
    const companyId = getCompanyId(request);
    const { dewormingId } = params;

    const result = await query(
      `SELECT vd.*,
        vp.name AS patient_name, vp.species AS patient_species,
        vpr.full_name AS professional_name
       FROM veterinary_dewormings vd
       LEFT JOIN veterinary_patients vp ON vp.id = vd.patient_id
       LEFT JOIN veterinary_professionals vpr ON vpr.id = vd.professional_id
       WHERE vd.id = $1 AND vd.company_id = $2`,
      [dewormingId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Desparasitación no encontrada', 404);
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse('Error al obtener desparasitación', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; dewormingId: string } }
) {
  try {
    const companyId = getCompanyId(request);
    const { dewormingId } = params;
    const body = await request.json();

    const {
      patient_id, professional_id, product_name, type,
      dose, application_date, next_due_date, notes,
    } = body;

    const result = await query(
      `UPDATE veterinary_dewormings SET
        patient_id = COALESCE($1, patient_id),
        professional_id = $2,
        product_name = COALESCE($3, product_name),
        type = COALESCE($4, type),
        dose = $5,
        application_date = COALESCE($6, application_date),
        next_due_date = $7,
        notes = $8
       WHERE id = $9 AND company_id = $10
       RETURNING *`,
      [patient_id || null, professional_id || null, product_name || null,
       type || null, dose || null, application_date || null,
       next_due_date || null, notes || null, dewormingId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Desparasitación no encontrada', 404);
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse('Error al actualizar desparasitación', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; dewormingId: string } }
) {
  try {
    const companyId = getCompanyId(request);
    const { dewormingId } = params;

    const result = await query(
      'DELETE FROM veterinary_dewormings WHERE id = $1 AND company_id = $2 RETURNING id',
      [dewormingId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Desparasitación no encontrada', 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Error al eliminar desparasitación', 500);
  }
}

import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; logId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    const { logId } = params;

    const result = await query(
      `SELECT vhl.*,
        vpr.full_name AS professional_name
       FROM veterinary_hospitalization_logs vhl
       JOIN veterinary_hospitalizations vh ON vh.id = vhl.hospitalization_id
       LEFT JOIN veterinary_professionals vpr ON vpr.id = vhl.professional_id
       WHERE vhl.id = $1 AND vh.company_id = $2`,
      [logId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Registro no encontrado', 404);
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse('Error al obtener registro', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; logId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    const { logId } = params;
    const body = await request.json();

    const {
      professional_id, log_time, temperature_c, heart_rate_bpm,
      respiratory_rate_bpm, feeding, hydration, medication_given,
      urinated, defecated, notes,
    } = body;

    const result = await query(
      `UPDATE veterinary_hospitalization_logs SET
        professional_id = $1,
        log_time = COALESCE($2, log_time),
        temperature_c = $3,
        heart_rate_bpm = $4,
        respiratory_rate_bpm = $5,
        feeding = $6,
        hydration = $7,
        medication_given = $8,
        urinated = $9,
        defecated = $10,
        notes = $11
       WHERE vhl.id = $12 AND vh.company_id = $13
       RETURNING vhl.*`,
      [professional_id || null, log_time || null, temperature_c || null,
       heart_rate_bpm || null, respiratory_rate_bpm || null,
       feeding || null, hydration || null, medication_given || null,
       urinated ?? null, defecated ?? null, notes || null,
       logId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Registro no encontrado', 404);
    }

    return successResponse(result.rows[0]);
  } catch (error) {
    return errorResponse('Error al actualizar registro', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; logId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    const { logId } = params;

    const result = await query(
      `DELETE FROM veterinary_hospitalization_logs vhl
       USING veterinary_hospitalizations vh
       WHERE vhl.id = $1 AND vhl.hospitalization_id = vh.id AND vh.company_id = $2
       RETURNING vhl.id`,
      [logId, companyId]
    );

    if (result.rows.length === 0) {
      return errorResponse('Registro no encontrado', 404);
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse('Error al eliminar registro', 500);
  }
}

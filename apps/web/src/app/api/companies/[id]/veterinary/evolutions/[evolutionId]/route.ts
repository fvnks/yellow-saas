import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; evolutionId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(`
      SELECT e.*,
        json_build_object('id', p.id, 'name', p.name, 'species', p.species, 'breed', p.breed) as patient,
        json_build_object('id', pr.id, 'full_name', pr.full_name, 'specialty', pr.specialty) as professional
      FROM veterinary_evolutions e
      LEFT JOIN veterinary_patients p ON p.id = e.patient_id
      LEFT JOIN veterinary_professionals pr ON pr.id = e.professional_id
      WHERE e.id = $1 AND e.company_id = $2
    `, [params.evolutionId, companyId]);

    if (!rows[0]) return errorResponse('Evolution not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch evolution', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; evolutionId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const {
      consultation_id, evolution_type, subjective, objective, assessment, plan,
      weight_kg, temperature_c, heart_rate_bpm, respiratory_rate_bpm,
      professional_id, diagnosis, evolution_date, evolution_time, status
    } = body;

    if (evolution_type) {
      const validTypes = ['consulta', 'control', 'procedimiento', 'post_operatorio', 'hospitalizacion', 'examen'];
      if (!validTypes.includes(evolution_type)) return errorResponse('Invalid evolution type', 400);
    }

    if (status) {
      const validStatuses = ['draft', 'final'];
      if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400);
    }

    const { rows } = await query(
      `UPDATE veterinary_evolutions SET
        consultation_id = $1, evolution_type = COALESCE($2, evolution_type),
        subjective = $3, objective = $4, assessment = $5, plan = $6,
        weight_kg = $7, temperature_c = $8, heart_rate_bpm = $9, respiratory_rate_bpm = $10,
        professional_id = $11, diagnosis = $12, evolution_date = COALESCE($13, evolution_date),
        evolution_time = COALESCE($14, evolution_time), status = COALESCE($15, status),
        updated_at = NOW()
       WHERE id = $16 AND company_id = $17
       RETURNING *`,
      [
        consultation_id !== undefined ? consultation_id : undefined,
        evolution_type || null,
        subjective !== undefined ? subjective : undefined,
        objective !== undefined ? objective : undefined,
        assessment !== undefined ? assessment : undefined,
        plan !== undefined ? plan : undefined,
        weight_kg !== undefined ? weight_kg : undefined,
        temperature_c !== undefined ? temperature_c : undefined,
        heart_rate_bpm !== undefined ? heart_rate_bpm : undefined,
        respiratory_rate_bpm !== undefined ? respiratory_rate_bpm : undefined,
        professional_id !== undefined ? professional_id : undefined,
        diagnosis !== undefined ? diagnosis : undefined,
        evolution_date || null,
        evolution_time || null,
        status || null,
        params.evolutionId, companyId
      ]
    );

    if (!rows[0]) return errorResponse('Evolution not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update evolution', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; evolutionId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      'DELETE FROM veterinary_evolutions WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.evolutionId, companyId]
    );

    if (!rows[0]) return errorResponse('Evolution not found', 404);

    return successResponse({ message: 'Evolution deleted successfully' });
  } catch {
    return errorResponse('Failed to delete evolution', 500);
  }
}

import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; vaccinationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(`
      SELECT v.*,
        json_build_object('id', p.id, 'name', p.name, 'species', p.species, 'breed', p.breed) as patient,
        json_build_object('id', pr.id, 'full_name', pr.full_name) as professional
      FROM veterinary_vaccinations v
      LEFT JOIN veterinary_patients p ON p.id = v.patient_id
      LEFT JOIN veterinary_professionals pr ON pr.id = v.professional_id
      WHERE v.id = $1 AND v.company_id = $2
    `, [params.vaccinationId, companyId]);

    if (!rows[0]) return errorResponse('Vaccination not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to fetch vaccination', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; vaccinationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const {
      professional_id, consultation_id, vaccine_name, manufacturer,
      batch_number, application_date, next_due_date, dose, notes
    } = body;

    const { rows } = await query(
      `UPDATE veterinary_vaccinations SET
        professional_id = $1, consultation_id = $2, vaccine_name = COALESCE($3, vaccine_name),
        manufacturer = $4, batch_number = $5, application_date = COALESCE($6, application_date),
        next_due_date = $7, dose = $8, notes = $9
       WHERE id = $10 AND company_id = $11
       RETURNING *`,
      [
        professional_id !== undefined ? professional_id : undefined,
        consultation_id !== undefined ? consultation_id : undefined,
        vaccine_name || null,
        manufacturer !== undefined ? manufacturer : undefined,
        batch_number !== undefined ? batch_number : undefined,
        application_date || null,
        next_due_date !== undefined ? next_due_date : undefined,
        dose !== undefined ? dose : undefined,
        notes !== undefined ? notes : undefined,
        params.vaccinationId, companyId
      ]
    );

    if (!rows[0]) return errorResponse('Vaccination not found', 404);

    return successResponse(rows[0]);
  } catch {
    return errorResponse('Failed to update vaccination', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; vaccinationId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      'DELETE FROM veterinary_vaccinations WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.vaccinationId, companyId]
    );

    if (!rows[0]) return errorResponse('Vaccination not found', 404);

    return successResponse({ message: 'Vaccination deleted successfully' });
  } catch {
    return errorResponse('Failed to delete vaccination', 500);
  }
}

import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; patientId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `SELECT p.*,
        c.full_name AS client_full_name,
        c.rut AS client_rut,
        c.phone AS client_phone,
        c.email AS client_email
       FROM veterinary_patients p
       LEFT JOIN veterinary_clients c ON p.client_id = c.id AND c.company_id = p.company_id
       WHERE p.id = $1 AND p.company_id = $2`,
      [params.patientId, companyId]
    );

    if (rows.length === 0) return errorResponse('Patient not found', 404);
    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; patientId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const {
      client_id, name, species, breed, gender, birth_date, color,
      current_weight_kg, microchip, registration_number, is_sterilized,
      temperament, allergies, chronic_conditions, permanent_medications,
      diet, notes, photo_url, status
    } = body;

    if (gender && !['macho', 'hembra', 'desconocido'].includes(gender)) {
      return errorResponse('Gender must be macho, hembra, or desconocido', 400);
    }

    if (client_id) {
      const clientCheck = await query(
        `SELECT id FROM veterinary_clients WHERE id = $1 AND company_id = $2`,
        [client_id, companyId]
      );
      if (clientCheck.rows.length === 0) {
        return errorResponse('Client not found', 404);
      }
    }

    const { rows } = await query(
      `UPDATE veterinary_patients SET
        client_id = COALESCE($1, client_id),
        name = COALESCE($2, name),
        species = COALESCE($3, species),
        breed = COALESCE($4, breed),
        gender = COALESCE($5, gender),
        birth_date = COALESCE($6, birth_date),
        color = COALESCE($7, color),
        current_weight_kg = COALESCE($8, current_weight_kg),
        microchip = COALESCE($9, microchip),
        registration_number = COALESCE($10, registration_number),
        is_sterilized = COALESCE($11, is_sterilized),
        temperament = COALESCE($12, temperament),
        allergies = COALESCE($13, allergies),
        chronic_conditions = COALESCE($14, chronic_conditions),
        permanent_medications = COALESCE($15, permanent_medications),
        diet = COALESCE($16, diet),
        notes = COALESCE($17, notes),
        photo_url = COALESCE($18, photo_url),
        status = COALESCE($19, status),
        updated_at = NOW()
       WHERE id = $20 AND company_id = $21
       RETURNING *`,
      [
        client_id ?? null, name || null, species || null, breed || null, gender || null,
        birth_date || null, color || null, current_weight_kg ?? null, microchip || null,
        registration_number || null, is_sterilized ?? null, temperament || null,
        allergies || null, chronic_conditions || null, permanent_medications || null,
        diet || null, notes || null, photo_url || null, status || null,
        params.patientId, companyId
      ]
    );

    if (rows.length === 0) return errorResponse('Patient not found', 404);
    return successResponse(rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; patientId: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { rows } = await query(
      `DELETE FROM veterinary_patients WHERE id = $1 AND company_id = $2 RETURNING id`,
      [params.patientId, companyId]
    );

    if (rows.length === 0) return errorResponse('Patient not found', 404);
    return successResponse({ message: 'Patient deleted' });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

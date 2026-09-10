import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const allowedSortColumns = ['created_at', 'study_date'];
    const sort = allowedSortColumns.includes(requestedSort) ? requestedSort : 'study_date';

    const { searchParams } = new URL(request.url);
    const patientIdFilter = searchParams.get('patient_id');
    const statusFilter = searchParams.get('status');

    let where = 'WHERE ims.company_id = $1';
    const args: any[] = [companyId];
    let paramIdx = 2;

    if (search) {
      where += ` AND (vp.name ILIKE $${paramIdx} OR ims.study_number ILIKE $${paramIdx} OR ims.region ILIKE $${paramIdx})`;
      args.push(`%${search}%`);
      paramIdx++;
    }
    if (patientIdFilter) {
      where += ` AND ims.patient_id = $${paramIdx}`;
      args.push(patientIdFilter);
      paramIdx++;
    }
    if (statusFilter) {
      where += ` AND ims.status = $${paramIdx}`;
      args.push(statusFilter);
      paramIdx++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM veterinary_imaging_studies ims
       LEFT JOIN veterinary_patients vp ON vp.id = ims.patient_id
       ${where}`, args
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    const result = await query(
      `SELECT ims.*,
              vp.name as patient_name, vp.species, vp.breed,
              vc.full_name as client_name, vc.rut as client_rut,
              vepr.full_name as professional_name
       FROM veterinary_imaging_studies ims
       LEFT JOIN veterinary_patients vp ON vp.id = ims.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = ims.client_id
       LEFT JOIN veterinary_professionals vepr ON vepr.id = ims.professional_id
       ${where}
       ORDER BY ims.${sort} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...args, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al obtener estudios', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const body = await request.json();
    const {
      patient_id, client_id, professional_id, study_type,
      study_date, region, findings, conclusion, image_count,
      modality, notes
    } = body;

    if (!patient_id || !client_id || !study_type) {
      return errorResponse('patient_id, client_id, y study_type son requeridos', 400);
    }

    const validTypes = ['radiografia','ecografia','tomografia','resonancia','endoscopia','electrocardiograma','otro'];
    if (!validTypes.includes(study_type)) return errorResponse('Tipo de estudio inválido', 400);

    // Verify patient and client belong to this company
    const [patientCheck, clientCheck] = await Promise.all([
      query('SELECT id FROM veterinary_patients WHERE id = $1 AND company_id = $2', [patient_id, companyId]),
      query('SELECT id FROM veterinary_clients WHERE id = $1 AND company_id = $2', [client_id, companyId]),
    ]);
    if (patientCheck.rows.length === 0) return errorResponse('Paciente no encontrado', 404);
    if (clientCheck.rows.length === 0) return errorResponse('Cliente no encontrado', 404);

    // Generate study number
    const { rows: numRows } = await query(
      `SELECT 'IMG-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(COALESCE(MAX(NULLIF(SUBSTRING(study_number FROM 6), '')::int), 0) + 1, 4, '0') as study_number
       FROM veterinary_imaging_studies WHERE company_id = $1 AND study_number LIKE 'IMG-' || TO_CHAR(NOW(), 'YYYY') || '-%'`,
      [companyId]
    );
    const study_number = numRows[0].study_number;

    const result = await query(
      `INSERT INTO veterinary_imaging_studies
       (company_id, patient_id, client_id, professional_id, study_number, study_type,
        study_date, region, findings, conclusion, image_count, modality, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [companyId, patient_id, client_id, professional_id || null, study_number,
       study_type, study_date || new Date().toISOString().split('T')[0],
       region || null, findings || null, conclusion || null,
       image_count || 0, modality || null, notes || null]
    );

    return successResponse(result.rows[0], 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al crear estudio', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const body = await request.json();
    const { id, findings, conclusion, status, notes, image_count } = body;

    if (!id) return errorResponse('id es requerido', 400);

    const result = await query(
      `UPDATE veterinary_imaging_studies SET
        findings = COALESCE($1, findings),
        conclusion = COALESCE($2, conclusion),
        status = COALESCE($3, status),
        notes = COALESCE($4, notes),
        image_count = COALESCE($5, image_count),
        updated_at = now()
       WHERE id = $6 AND company_id = $7
       RETURNING *`,
      [findings, conclusion, status, notes, image_count, id, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Estudio no encontrado', 404);
    return successResponse(result.rows[0]);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al actualizar estudio', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return errorResponse('id es requerido', 400);

    const result = await query(
      'DELETE FROM veterinary_imaging_studies WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, companyId]
    );

    if (result.rows.length === 0) return errorResponse('Estudio no encontrado', 404);
    return successResponse({ deleted: true });
  } catch (error: any) {
    return errorResponse(error.message || 'Error al eliminar estudio', 500);
  }
}

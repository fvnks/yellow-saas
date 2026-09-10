import { NextRequest } from 'next/server';
import { query, transaction } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const patientId = url.searchParams.get('patient_id');

    const allowedSorts: Record<string, string> = {
      created_at: 'vp.created_at',
      prescription_date: 'vp.prescription_date',
    };
    const sortColumn = allowedSorts[sort] || 'vp.created_at';

    const conditions: string[] = ['vp.company_id = $1'];
    const params: unknown[] = [companyId];
    let paramIndex = 2;

    if (search) {
      conditions.push(`(
        vpt.name ILIKE $${paramIndex} OR
        vc.full_name ILIKE $${paramIndex} OR
        EXISTS (SELECT 1 FROM veterinary_prescription_items vpi WHERE vpi.prescription_id = vp.id AND vpi.medication_name ILIKE $${paramIndex})
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (patientId) {
      conditions.push(`vp.patient_id = $${paramIndex}`);
      params.push(patientId);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM veterinary_prescriptions vp
       LEFT JOIN veterinary_patients vpt ON vpt.id = vp.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = vp.client_id
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT vp.*,
        vpt.name AS patient_name, vpt.species AS patient_species,
        vc.full_name AS client_name,
        vpr.full_name AS professional_name,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', vpi.id, 'medication_name', vpi.medication_name, 'active_ingredient', vpi.active_ingredient,
            'presentation', vpi.presentation, 'dose', vpi.dose, 'frequency', vpi.frequency,
            'duration', vpi.duration, 'route', vpi.route, 'quantity', vpi.quantity,
            'special_instructions', vpi.special_instructions
          )) FROM veterinary_prescription_items vpi WHERE vpi.prescription_id = vp.id), '[]'
        ) as items
       FROM veterinary_prescriptions vp
       LEFT JOIN veterinary_patients vpt ON vpt.id = vp.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = vp.client_id
       LEFT JOIN veterinary_professionals vpr ON vpr.id = vp.professional_id
       ${whereClause}
       ORDER BY ${sortColumn} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (error) {
    return errorResponse('Error al obtener prescripciones', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const body = await request.json();

    const {
      consultation_id, patient_id, client_id, professional_id,
      prescription_date, instructions, status = 'active', items,
    } = body;

    if (!patient_id || !client_id || !professional_id) {
      return errorResponse('patient_id, client_id y professional_id son requeridos', 400);
    }

    const [patientCheck, clientCheck, professionalCheck] = await Promise.all([
      query('SELECT id FROM veterinary_patients WHERE id = $1 AND company_id = $2', [patient_id, companyId]),
      query('SELECT id FROM veterinary_clients WHERE id = $1 AND company_id = $2', [client_id, companyId]),
      query('SELECT id FROM veterinary_professionals WHERE id = $1 AND company_id = $2', [professional_id, companyId]),
    ]);
    if (patientCheck.rows.length === 0) return errorResponse('Paciente no encontrado', 404);
    if (clientCheck.rows.length === 0) return errorResponse('Cliente no encontrado', 404);
    if (professionalCheck.rows.length === 0) return errorResponse('Profesional no encontrado', 404);

    const result = await transaction(async (client) => {
      const presc = await client.query(
        `INSERT INTO veterinary_prescriptions
          (company_id, consultation_id, patient_id, client_id, professional_id, prescription_date, instructions, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [companyId, consultation_id || null, patient_id, client_id, professional_id,
         prescription_date || new Date().toISOString().split('T')[0], instructions || null, status]
      );

      if (items && items.length > 0) {
        for (const item of items) {
          await client.query(
            `INSERT INTO veterinary_prescription_items
              (prescription_id, company_id, medication_name, active_ingredient, presentation, dose, frequency, duration, route, quantity, special_instructions)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [presc.rows[0].id, companyId, item.medication_name, item.active_ingredient || null,
             item.presentation || null, item.dose || null, item.frequency || null,
             item.duration || null, item.route || null, item.quantity || null,
             item.special_instructions || null]
          );
        }
      }

      return presc;
    });

    return successResponse(result.rows[0], 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('foreign key')) {
      return errorResponse('Uno de los registros referenciados no existe', 400);
    }
    return errorResponse('Error al crear prescripción', 500);
  }
}

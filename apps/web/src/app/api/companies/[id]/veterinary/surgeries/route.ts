import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);

    const allowedSorts: Record<string, string> = {
      created_at: 'vs.created_at',
      scheduled_date: 'vs.scheduled_date',
    };
    const sortColumn = allowedSorts[sort] || 'vs.created_at';

    const conditions: string[] = ['vs.company_id = $1'];
    const params: unknown[] = [companyId];
    let paramIndex = 2;

    if (search) {
      conditions.push(`(
        vp.name ILIKE $${paramIndex} OR
        vs.surgery_name ILIKE $${paramIndex} OR
        vsurgeon.full_name ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM veterinary_surgeries vs
       LEFT JOIN veterinary_patients vp ON vp.id = vs.patient_id
       LEFT JOIN veterinary_professionals vsurgeon ON vsurgeon.id = vs.surgeon_id
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT vs.*,
        vp.name AS patient_name, vp.species AS patient_species,
        vc.full_name AS client_name,
        vsurgeon.full_name AS surgeon_name,
        van.full_name AS anesthetist_name,
        vr.name AS room_name
       FROM veterinary_surgeries vs
       LEFT JOIN veterinary_patients vp ON vp.id = vs.patient_id
       LEFT JOIN veterinary_clients vc ON vc.id = vs.client_id
       LEFT JOIN veterinary_professionals vsurgeon ON vsurgeon.id = vs.surgeon_id
       LEFT JOIN veterinary_professionals van ON van.id = vs.anesthetist_id
       LEFT JOIN veterinary_surgery_rooms vr ON vr.id = vs.room_id
       ${whereClause}
       ORDER BY ${sortColumn} ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (error) {
    return errorResponse('Error al obtener cirugías', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const body = await request.json();

    const {
      patient_id, client_id, surgeon_id, anesthetist_id, surgery_name,
      scheduled_date, room_id, pre_op_evaluation, surgery_report,
      post_op_instructions, status = 'scheduled',
    } = body;

    if (!patient_id || !client_id || !surgeon_id || !surgery_name) {
      return errorResponse('patient_id, client_id, surgeon_id y surgery_name son requeridos', 400);
    }

    const result = await query(
      `INSERT INTO veterinary_surgeries
        (company_id, patient_id, client_id, surgeon_id, anesthetist_id, surgery_name,
         scheduled_date, room_id, pre_op_evaluation, surgery_report, post_op_instructions, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [companyId, patient_id, client_id, surgeon_id, anesthetist_id || null,
       surgery_name, scheduled_date || null, room_id || null,
       pre_op_evaluation || null, surgery_report || null,
       post_op_instructions || null, status]
    );

    return successResponse(result.rows[0], 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('foreign key')) {
      return errorResponse('Uno de los registros referenciados no existe', 400);
    }
    return errorResponse('Error al crear cirugía', 500);
  }
}

import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const { page, limit, sort, order, offset } = parseSearchParams(request);
    const url = new URL(request.url);
    const hospitalizationId = url.searchParams.get('hospitalization_id');

    const conditions: string[] = ['vh.company_id = $1'];
    const params: unknown[] = [companyId];
    let paramIndex = 2;

    if (hospitalizationId) {
      conditions.push(`vhl.hospitalization_id = $${paramIndex}`);
      params.push(hospitalizationId);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM veterinary_hospitalization_logs vhl
       JOIN veterinary_hospitalizations vh ON vh.id = vhl.hospitalization_id
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT vhl.*,
        vpr.full_name AS professional_name
       FROM veterinary_hospitalization_logs vhl
       JOIN veterinary_hospitalizations vh ON vh.id = vhl.hospitalization_id
       LEFT JOIN veterinary_professionals vpr ON vpr.id = vhl.professional_id
       ${whereClause}
       ORDER BY vhl.log_time ${order === 'asc' ? 'ASC' : 'DESC'}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (error) {
    return errorResponse('Error al obtener registros de hospitalización', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const body = await request.json();

    const {
      hospitalization_id, professional_id, log_time,
      temperature_c, heart_rate_bpm, respiratory_rate_bpm,
      feeding, hydration, medication_given, urinated, defecated, notes,
    } = body;

    if (!hospitalization_id) {
      return errorResponse('hospitalization_id es requerido', 400);
    }

    const hospCheck = await query(
      'SELECT id FROM veterinary_hospitalizations WHERE id = $1 AND company_id = $2',
      [hospitalization_id, companyId]
    );

    if (hospCheck.rows.length === 0) {
      return errorResponse('Hospitalización no encontrada', 404);
    }

    const result = await query(
      `INSERT INTO veterinary_hospitalization_logs
        (hospitalization_id, professional_id, log_time, temperature_c,
         heart_rate_bpm, respiratory_rate_bpm, feeding, hydration,
         medication_given, urinated, defecated, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [hospitalization_id, professional_id || null, log_time || new Date().toISOString(),
       temperature_c || null, heart_rate_bpm || null, respiratory_rate_bpm || null,
       feeding || null, hydration || null, medication_given || null,
       urinated ?? false, defecated ?? false, notes || null]
    );

    return successResponse(result.rows[0], 201);
  } catch (error) {
    return errorResponse('Error al crear registro de hospitalización', 500);
  }
}

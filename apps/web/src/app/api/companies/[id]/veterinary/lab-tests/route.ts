import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';

export async function GET(req: NextRequest) {
  try {
    const companyId = getCompanyId(req);
    const params = parseSearchParams(req);
    const { page = 1, limit = 50, search = '' } = params;
    const offset = (page - 1) * limit;

    const url = new URL(req.url);
    const panel_id = url.searchParams.get('panel_id');

    let where = 'WHERE lt.company_id = $1';
    const args: any[] = [companyId];
    let paramIdx = 2;

    if (panel_id) {
      where += ` AND lt.panel_id = $${paramIdx}`;
      args.push(panel_id);
      paramIdx++;
    }

    if (search) {
      where += ` AND (lt.name ILIKE $${paramIdx} OR lt.code ILIKE $${paramIdx})`;
      args.push(`%${search}%`);
      paramIdx++;
    }

    const countResult = await query(`SELECT COUNT(*) FROM veterinary_lab_tests lt ${where}`, args);
    const total = parseInt(countResult.rows[0]?.count || '0');

    const result = await query(
      `SELECT lt.*, lp.name as panel_name
       FROM veterinary_lab_tests lt
       LEFT JOIN veterinary_lab_panels lp ON lp.id = lt.panel_id AND lp.company_id = lt.company_id
       ${where}
       ORDER BY lt.sort_order ASC, lt.name ASC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...args, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al obtener exámenes de laboratorio', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = getCompanyId(req);
    const body = await req.json();
    const { panel_id, name, code, unit, reference_range, reference_range_feline, reference_range_avian, sort_order } = body;

    if (!panel_id || !name || !code) {
      return errorResponse('panel_id, name y code son requeridos', 400);
    }

    const result = await query(
      `INSERT INTO veterinary_lab_tests (company_id, panel_id, name, code, unit, reference_range, reference_range_feline, reference_range_avian, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [companyId, panel_id, name, code, unit || null, reference_range || null, reference_range_feline || null, reference_range_avian || null, sort_order || 0]
    );

    return successResponse(result.rows[0], 201);
  } catch (error: any) {
    if (error.code === '23505') {
      return errorResponse('Ya existe un examen con ese código en este panel', 409);
    }
    return errorResponse(error.message || 'Error al crear examen', 500);
  }
}

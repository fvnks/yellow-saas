import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);

    let where = 'WHERE company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (search) {
      where += ` AND (full_name ILIKE $${paramIndex} OR specialty ILIKE $${paramIndex} OR rut ILIKE $${paramIndex} OR professional_license ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const allowedSort = ['created_at', 'full_name', 'specialty'];
    const sortColumn = allowedSort.includes(requestedSort) ? requestedSort : 'created_at';

    const { rows } = await query(
      `SELECT * FROM veterinary_professionals ${where}
       ORDER BY ${sortColumn} ${order === 'desc' ? 'DESC' : 'ASC'}
       OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      [...params, offset, limit]
    );

    const { rows: countRows } = await query(`SELECT COUNT(*) FROM veterinary_professionals ${where}`, params);
    const total = parseInt(countRows[0]?.count || '0');

    return paginatedResponse(rows, total, page, limit);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { user_id, full_name, rut, professional_license, specialty, phone, email, role, status } = body;

    if (!full_name) return errorResponse('Full name is required', 400);

    if (role && !['veterinario', 'tecnico', 'asistente', 'cirujano', 'recepcion'].includes(role)) {
      return errorResponse('Role must be veterinario, tecnico, asistente, cirujano, or recepcion', 400);
    }

    if (rut) {
      const existing = await query(
        `SELECT id FROM veterinary_professionals WHERE company_id = $1 AND LOWER(rut) = LOWER($2)`,
        [companyId, rut]
      );
      if (existing.rows.length > 0) {
        return errorResponse('A professional with this RUT already exists', 409);
      }
    }

    const result = await query(
      `INSERT INTO veterinary_professionals (company_id, user_id, full_name, rut, professional_license, specialty, phone, email, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        companyId, user_id || null, full_name, rut || null, professional_license || null,
        specialty || 'Medicina General', phone || null, email || null, role || 'veterinario', status || 'active'
      ]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

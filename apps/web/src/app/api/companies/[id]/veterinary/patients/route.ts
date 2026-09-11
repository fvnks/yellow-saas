import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const { page, limit, search, sort: requestedSort, order, offset } = parseSearchParams(request);
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    let where = 'WHERE p.company_id = $1';
    const params: any[] = [companyId];
    let paramIndex = 2;

    if (clientId) {
      where += ` AND p.client_id = $${paramIndex}`;
      params.push(clientId);
      paramIndex++;
    }

    if (search) {
      where += ` AND (p.name ILIKE $${paramIndex} OR p.breed ILIKE $${paramIndex} OR p.microchip ILIKE $${paramIndex} OR c.full_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const allowedSort = ['created_at', 'name', 'species'];
    const sortColumn = allowedSort.includes(requestedSort) ? requestedSort : 'created_at';

    const { rows } = await query(
      `SELECT p.*,
        c.full_name AS client_full_name,
        c.rut AS client_rut
       FROM veterinary_patients p
       LEFT JOIN veterinary_clients c ON p.client_id = c.id AND c.company_id = p.company_id
       ${where}
       ORDER BY p.${sortColumn} ${order === 'desc' ? 'DESC' : 'ASC'}
       OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`,
      [...params, offset, limit]
    );

    const { rows: countRows } = await query(
      `SELECT COUNT(*) FROM veterinary_patients p
       LEFT JOIN veterinary_clients c ON p.client_id = c.id AND c.company_id = p.company_id
       ${where}`,
      params
    );
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
    const {
      client_id, name, species, breed, gender, birth_date, color,
      current_weight_kg, microchip, registration_number, is_sterilized,
      temperament, allergies, chronic_conditions, permanent_medications,
      diet, notes, photo_url, status
    } = body;

    if (!client_id || !name) return errorResponse('Client ID and name are required', 400);

    if (gender && !['macho', 'hembra', 'desconocido'].includes(gender)) {
      return errorResponse('Gender must be macho, hembra, or desconocido', 400);
    }

    const clientCheck = await query(
      `SELECT id FROM veterinary_clients WHERE id = $1 AND company_id = $2`,
      [client_id, companyId]
    );
    if (clientCheck.rows.length === 0) {
      return errorResponse('Client not found', 404);
    }

    const result = await query(
      `INSERT INTO veterinary_patients (company_id, client_id, name, species, breed, gender, birth_date, color, current_weight_kg, microchip, registration_number, is_sterilized, temperament, allergies, chronic_conditions, permanent_medications, diet, notes, photo_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING *`,
      [
        companyId, client_id, name, species || null, breed || null, gender || 'desconocido',
        birth_date || null, color || null, current_weight_kg || null, microchip || null,
        registration_number || null, is_sterilized || false, temperament || null,
        allergies || null, chronic_conditions || null, permanent_medications || null,
        diet || null, notes || null, photo_url || null, status || 'active'
      ]
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

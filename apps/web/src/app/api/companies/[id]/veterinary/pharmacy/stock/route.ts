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
    const status = url.searchParams.get('status') || '';

    let where = 'WHERE company_id = $1';
    const args: any[] = [companyId];
    let paramIdx = 2;

    if (search) {
      where += ` AND (medication_name ILIKE $${paramIdx} OR active_ingredient ILIKE $${paramIdx} OR batch_number ILIKE $${paramIdx})`;
      args.push(`%${search}%`);
      paramIdx++;
    }

    if (status) {
      where += ` AND status = $${paramIdx}`;
      args.push(status);
      paramIdx++;
    }

    const countResult = await query(`SELECT COUNT(*) FROM veterinary_pharmacy_stock ${where}`, args);
    const total = parseInt(countResult.rows[0]?.count || '0');

    const result = await query(
      `SELECT * FROM veterinary_pharmacy_stock ${where}
       ORDER BY medication_name ASC, expiry_date ASC NULLS LAST
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...args, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al obtener stock de farmacia', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = getCompanyId(req);
    const body = await req.json();
    const {
      medication_name, active_ingredient, concentration, pharmaceutical_form,
      laboratory, batch_number, expiry_date, quantity, min_stock,
      unit_price_clp, sale_price_clp, supplier, location, notes
    } = body;

    if (!medication_name) return errorResponse('medication_name es requerido', 400);

    const result = await query(
      `INSERT INTO veterinary_pharmacy_stock
       (company_id, medication_name, active_ingredient, concentration, pharmaceutical_form,
        laboratory, batch_number, expiry_date, quantity, min_stock, unit_price_clp, sale_price_clp,
        supplier, location, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        companyId, medication_name, active_ingredient || null, concentration || null,
        pharmaceutical_form || null, laboratory || null, batch_number || null,
        expiry_date || null, quantity || 0, min_stock || 5,
        unit_price_clp || 0, sale_price_clp || 0, supplier || null,
        location || null, notes || null
      ]
    );

    return successResponse(result.rows[0], 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al crear registro de farmacia', 500);
  }
}

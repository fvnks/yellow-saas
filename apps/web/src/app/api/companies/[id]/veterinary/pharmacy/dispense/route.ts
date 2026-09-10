import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from '@/api/lib/helpers';

export async function GET(req: NextRequest) {
  try {
    const companyId = getCompanyId(req);
    const params = parseSearchParams(req);
    const { page = 1, limit = 50 } = params;
    const offset = (page - 1) * limit;

    const url = new URL(req.url);
    const stock_id = url.searchParams.get('stock_id');
    const patient_id = url.searchParams.get('patient_id');

    let where = 'WHERE d.company_id = $1';
    const args: any[] = [companyId];
    let paramIdx = 2;

    if (stock_id) {
      where += ` AND d.stock_id = $${paramIdx}`;
      args.push(stock_id);
      paramIdx++;
    }
    if (patient_id) {
      where += ` AND d.patient_id = $${paramIdx}`;
      args.push(patient_id);
      paramIdx++;
    }

    const countResult = await query(`SELECT COUNT(*) FROM veterinary_pharmacy_dispenses d ${where}`, args);
    const total = parseInt(countResult.rows[0]?.count || '0');

    const result = await query(
      `SELECT d.*, s.medication_name, s.batch_number,
              p.name as patient_name, pr.full_name as professional_name
       FROM veterinary_pharmacy_dispenses d
       LEFT JOIN veterinary_pharmacy_stock s ON s.id = d.stock_id
       LEFT JOIN veterinary_patients p ON p.id = d.patient_id
       LEFT JOIN veterinary_professionals pr ON pr.id = d.professional_id
       ${where}
       ORDER BY d.dispensed_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...args, limit, offset]
    );

    return paginatedResponse(result.rows, total, page, limit);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al obtener dispensaciones', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = getCompanyId(req);
    const body = await req.json();
    const { stock_id, patient_id, prescription_id, professional_id, quantity_dispensed, unit_price_clp, notes } = body;

    if (!stock_id || !quantity_dispensed || quantity_dispensed <= 0) {
      return errorResponse('stock_id y quantity_dispensed (>0) son requeridos', 400);
    }

    // Check stock availability
    const stockResult = await query(
      'SELECT * FROM veterinary_pharmacy_stock WHERE id = $1 AND company_id = $2',
      [stock_id, companyId]
    );
    if (stockResult.rows.length === 0) return errorResponse('Medicamento no encontrado', 404);

    const stock = stockResult.rows[0];
    if (stock.quantity < quantity_dispensed) {
      return errorResponse(`Stock insuficiente. Disponible: ${stock.quantity}`, 400);
    }

    const total_price = (unit_price_clp || stock.sale_price_clp || 0) * quantity_dispensed;

    // Create dispense record
    const dispenseResult = await query(
      `INSERT INTO veterinary_pharmacy_dispenses
       (company_id, stock_id, patient_id, prescription_id, professional_id,
        quantity_dispensed, unit_price_clp, total_price_clp, dispensed_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, auth.uid())
       RETURNING *`,
      [companyId, stock_id, patient_id || null, prescription_id || null,
       professional_id || null, quantity_dispensed, unit_price_clp || stock.sale_price_clp || 0, total_price]
    );

    // Decrease stock
    await query(
      `UPDATE veterinary_pharmacy_stock SET quantity = quantity - $1,
        status = CASE WHEN quantity - $1 <= 0 THEN 'depleted' ELSE status END,
        updated_at = now()
       WHERE id = $2 AND company_id = $3`,
      [quantity_dispensed, stock_id, companyId]
    );

    return successResponse(dispenseResult.rows[0], 201);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al dispensar medicamento', 500);
  }
}

import { NextRequest } from 'next/server';
import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';

export async function GET(req: NextRequest, { params }: { params: { id: string; stockId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    const result = await query(
      'SELECT * FROM veterinary_pharmacy_stock WHERE id = $1 AND company_id = $2',
      [params.stockId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Registro no encontrado', 404);
    return successResponse(result.rows[0]);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al obtener registro', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string; stockId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    const body = await req.json();
    const {
      medication_name, active_ingredient, concentration, pharmaceutical_form,
      laboratory, batch_number, expiry_date, quantity, min_stock,
      unit_price_clp, sale_price_clp, supplier, location, status, notes
    } = body;

    const result = await query(
      `UPDATE veterinary_pharmacy_stock SET
        medication_name = COALESCE($1, medication_name), active_ingredient = COALESCE($2, active_ingredient),
        concentration = COALESCE($3, concentration), pharmaceutical_form = COALESCE($4, pharmaceutical_form),
        laboratory = COALESCE($5, laboratory), batch_number = COALESCE($6, batch_number),
        expiry_date = COALESCE($7, expiry_date), quantity = COALESCE($8, quantity),
        min_stock = COALESCE($9, min_stock), unit_price_clp = COALESCE($10, unit_price_clp),
        sale_price_clp = COALESCE($11, sale_price_clp), supplier = COALESCE($12, supplier),
        location = COALESCE($13, location), status = COALESCE($14, status), notes = COALESCE($15, notes),
        updated_at = now()
       WHERE id = $16 AND company_id = $17
       RETURNING *`,
      [
        medication_name, active_ingredient, concentration, pharmaceutical_form,
        laboratory, batch_number, expiry_date, quantity, min_stock,
        unit_price_clp, sale_price_clp, supplier, location, status, notes,
        params.stockId, companyId
      ]
    );

    if (result.rows.length === 0) return errorResponse('Registro no encontrado', 404);
    return successResponse(result.rows[0]);
  } catch (error: any) {
    return errorResponse(error.message || 'Error al actualizar registro', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; stockId: string } }) {
  try {
    const companyId = await getCompanyId(req);
    const result = await query(
      'DELETE FROM veterinary_pharmacy_stock WHERE id = $1 AND company_id = $2 RETURNING id',
      [params.stockId, companyId]
    );
    if (result.rows.length === 0) return errorResponse('Registro no encontrado', 404);
    return successResponse({ deleted: true });
  } catch (error: any) {
    return errorResponse(error.message || 'Error al eliminar registro', 500);
  }
}

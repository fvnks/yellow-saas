import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    let whereClause = "WHERE r.company_id = $1 AND r.property_id = $2";
    const params_: any[] = [companyId, pParams.propertyId];
    let paramIndex = 3;
    if (search) {
      whereClause += ` AND (ca.name ILIKE $${paramIndex} OR u.unit_number ILIKE $${paramIndex} OR r.reserver_name ILIKE $${paramIndex})`;
      params_.push(`%${search}%`);
      paramIndex++;
    }
    const countResult = await query(
      `SELECT COUNT(*) FROM condos_reservations r JOIN condos_common_areas ca ON ca.id = r.common_area_id JOIN condos_units u ON u.id = r.unit_id ${whereClause}`,
      params_,
    );
    const dataResult = await query(
      `SELECT r.*, ca.name as space_name, u.unit_number,
              COALESCE(u.resident_name, 'Copropietario') as reserver_name
       FROM condos_reservations r
       JOIN condos_common_areas ca ON ca.id = r.common_area_id
       JOIN condos_units u ON u.id = r.unit_id
       ${whereClause}
       ORDER BY r.reservation_date DESC, r.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params_, limit, offset],
    );
    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const body = await request.json();
    const { common_area_id, unit_id, reservation_date, time_slot, fee_clp, deposit_clp, notes } = body;
    if (!common_area_id || !unit_id || !reservation_date || !time_slot) return errorResponse("common_area_id, unit_id, reservation_date and time_slot are required", 400);

    // Verify unit belongs to this property
    const unitCheck = await query(
      `SELECT id, resident_name FROM condos_units WHERE id = $1 AND company_id = $2 AND property_id = $3`,
      [unit_id, companyId, pParams.propertyId],
    );
    if (unitCheck.rows.length === 0) return errorResponse("Unit not found in this property", 404);
    const reserverName = unitCheck.rows[0]?.resident_name || 'Copropietario';

    // Verify common area belongs to this property
    const caCheck = await query(
      `SELECT id FROM condos_common_areas WHERE id = $1 AND company_id = $2 AND property_id = $3`,
      [common_area_id, companyId, pParams.propertyId],
    );
    if (caCheck.rows.length === 0) return errorResponse("Common area not found in this property", 404);

    const result = await query(
      `INSERT INTO condos_reservations (company_id, property_id, common_area_id, unit_id, reserver_name, reservation_date, time_slot, fee_clp, deposit_clp, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'confirmed')
       RETURNING *`,
      [companyId, pParams.propertyId, common_area_id, unit_id, reserverName, reservation_date, time_slot, Number(fee_clp) || 0, Number(deposit_clp) || 0, notes || null],
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

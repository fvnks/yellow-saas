import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    let whereClause = "WHERE v.company_id = $1 AND v.property_id = $2";
    const params_: any[] = [companyId, pParams.propertyId];
    let paramIndex = 3;
    if (search) {
      whereClause += ` AND (v.visitor_name ILIKE $${paramIndex} OR v.visitor_rut ILIKE $${paramIndex} OR v.vehicle_plate ILIKE $${paramIndex})`;
      params_.push(`%${search}%`);
      paramIndex++;
    }
    const countResult = await query(
      `SELECT COUNT(*) FROM condos_visitors v ${whereClause}`,
      params_,
    );
    const dataResult = await query(
      `SELECT v.*
       FROM condos_visitors v
       ${whereClause}
       ORDER BY v.created_at DESC
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
    const { visitor_name, visitor_rut, vehicle_plate, destination_unit_number, parking_spot, notes } = body;
    if (!visitor_name) return errorResponse("visitor_name is required", 400);

    const result = await query(
      `INSERT INTO condos_visitors (company_id, property_id, visitor_name, visitor_rut, vehicle_plate, destination_unit_number, parking_spot, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
       RETURNING *`,
      [companyId, pParams.propertyId, visitor_name, visitor_rut || null, vehicle_plate || null, destination_unit_number || null, parking_spot || null, notes || null],
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const body = await request.json();
    const { id } = body;
    if (!id) return errorResponse("id is required", 400);

    const result = await query(
      `UPDATE condos_visitors
       SET status = 'exited', exit_time = now(), updated_at = now()
       WHERE id = $1 AND company_id = $2 AND property_id = $3
       RETURNING *`,
      [id, companyId, pParams.propertyId],
    );

    if (result.rows.length === 0) return errorResponse("Visitor not found", 404);
    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

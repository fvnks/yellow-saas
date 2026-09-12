import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    let whereClause = "WHERE company_id = $1 AND property_id = $2 AND is_active = true";
    const params_: any[] = [companyId, pParams.propertyId];
    let paramIndex = 3;
    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params_.push(`%${search}%`);
      paramIndex++;
    }
    const countResult = await query(
      `SELECT COUNT(*) FROM condos_common_areas ${whereClause}`,
      params_,
    );
    const dataResult = await query(
      `SELECT * FROM condos_common_areas
       ${whereClause}
       ORDER BY name ASC
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
    const { name, description, capacity, hourly_rate_clp, deposit_clp } = body;
    if (!name) return errorResponse("name is required", 400);

    const result = await query(
      `INSERT INTO condos_common_areas (company_id, property_id, name, description, capacity, hourly_rate_clp, deposit_clp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [companyId, pParams.propertyId, name, description || null, Number(capacity) || 0, Number(hourly_rate_clp) || 0, Number(deposit_clp) || 0],
    );

    return successResponse(result.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

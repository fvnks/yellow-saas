import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    let whereClause = "WHERE u.company_id = $1 AND u.property_id = $2";
    const params_: any[] = [companyId, pParams.propertyId];
    let paramIndex = 3;
    if (search) {
      whereClause += ` AND (u.unit_number ILIKE $${paramIndex} OR u.resident_name ILIKE $${paramIndex})`;
      params_.push(`%${search}%`);
      paramIndex++;
    }
    const countResult = await query(`SELECT COUNT(*) FROM condos_units u ${whereClause}`, params_);
    const dataResult = await query(
      `SELECT u.*, c.name as owner_name, c.email as owner_email FROM condos_units u LEFT JOIN customers c ON c.id = u.owner_id ${whereClause} ORDER BY u.unit_number ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params_, limit, offset],
    );
    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const body = await request.json();
    const { unit_number, type, owner_id, resident_name, resident_email, resident_phone, notes } = body;
    if (!unit_number) return errorResponse("Unit number is required", 400);
    const result = await query(
      `INSERT INTO condos_units (company_id, property_id, unit_number, type, owner_id, resident_name, resident_email, resident_phone, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [companyId, pParams.propertyId, unit_number, type || "apartment", owner_id || null, resident_name || null, resident_email || null, resident_phone || null, notes || null],
    );
    const newUnit = result.rows[0];
    if (newUnit) {
      await query(
        `INSERT INTO condos_coefficients (company_id, property_id, unit_id, category, coefficient_pct, percentage) VALUES ($1, $2, $3, 'general', 0.00000, 0.00000) ON CONFLICT (unit_id, category) DO NOTHING`,
        [companyId, pParams.propertyId, newUnit.id],
      );
    }
    return successResponse(newUnit, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { page, limit, search, sort, order, offset } = parseSearchParams(request);
    let whereClause = "WHERE company_id = $1 AND is_active = true";
    const params: any[] = [companyId];
    let paramIndex = 2;
    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR city ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    const countResult = await query(`SELECT COUNT(*) FROM condos_properties ${whereClause}`, params);
    const dataResult = await query(
      `SELECT * FROM condos_properties ${whereClause} ORDER BY ${sort === "name" ? "name" : "created_at"} ${order === "asc" ? "ASC" : "DESC"} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );
    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const body = await request.json();
    const { name, rut, address, commune, city, total_units, reserve_fund_pct, late_interest_pct, due_day } = body;
    if (!name) return errorResponse("Name is required", 400);
    const result = await query(
      `INSERT INTO condos_properties (company_id, name, rut, address, commune, city, total_units, reserve_fund_pct, late_interest_pct, due_day) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [companyId, name, rut || null, address || null, commune || null, city || null, total_units || 0, reserve_fund_pct || 5.00, late_interest_pct || 1.50, due_day || 10],
    );
    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

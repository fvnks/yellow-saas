import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { page, limit, sort, order, offset } = parseSearchParams(request);
    const countResult = await query(`SELECT COUNT(*) FROM condos_periods WHERE company_id = $1 AND property_id = $2`, [companyId, pParams.propertyId]);
    const dataResult = await query(
      `SELECT * FROM condos_periods WHERE company_id = $1 AND property_id = $2 ORDER BY period_date DESC LIMIT $3 OFFSET $4`,
      [companyId, pParams.propertyId, limit, offset],
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
    const { period_date, due_date } = body;
    if (!period_date) return errorResponse("period_date is required", 400);
    const d = new Date(period_date);
    const year = d.getFullYear() || new Date().getFullYear();
    const month = d.getMonth() + 1 || 1;
    const period_code = `${year}-${String(month).padStart(2, "0")}`;
    const result = await query(
      `INSERT INTO condos_periods (company_id, property_id, period_date, period_code, year, month, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [companyId, pParams.propertyId, period_date, period_code, year, month, due_date || period_date],
    );
    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

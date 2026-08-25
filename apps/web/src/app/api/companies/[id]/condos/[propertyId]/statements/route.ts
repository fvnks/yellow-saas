import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { page, limit, sort, order, offset, search } = parseSearchParams(request);
    let whereClause = "WHERE cus.company_id = $1 AND cus.property_id = $2";
    const params_: any[] = [companyId, pParams.propertyId];
    let paramIndex = 3;
    if (search) {
      whereClause += ` AND (u.unit_number ILIKE $${paramIndex} OR cus.status ILIKE $${paramIndex})`;
      params_.push(`%${search}%`);
      paramIndex++;
    }
    const countResult = await query(`SELECT COUNT(*) FROM condos_unit_statements cus JOIN condos_units u ON u.id = cus.unit_id JOIN condos_periods p ON p.id = cus.period_id ${whereClause}`, params_);
    const dataResult = await query(
      `SELECT cus.*, u.unit_number, p.period_date FROM condos_unit_statements cus JOIN condos_units u ON u.id = cus.unit_id JOIN condos_periods p ON p.id = cus.period_id ${whereClause} ORDER BY p.period_date DESC, u.unit_number ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params_, limit, offset],
    );
    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

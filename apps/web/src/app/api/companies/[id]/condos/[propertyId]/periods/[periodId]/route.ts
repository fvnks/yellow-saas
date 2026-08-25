import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string; periodId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const result = await query(`SELECT * FROM condos_periods WHERE id = $1 AND company_id = $2`, [pParams.periodId, companyId]);
    if (result.rows.length === 0) return errorResponse("Period not found", 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string; periodId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const body = await request.json();
    const { status, due_date } = body;
    const result = await query(
      `UPDATE condos_periods SET status = COALESCE($1, status), due_date = COALESCE($2, due_date), updated_at = now() WHERE id = $3 AND company_id = $4 RETURNING *`,
      [status, due_date, pParams.periodId, companyId],
    );
    if (result.rows.length === 0) return errorResponse("Period not found", 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

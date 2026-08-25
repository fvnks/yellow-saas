import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const result = await query(`SELECT * FROM condos_properties WHERE id = $1 AND company_id = $2`, [pParams.propertyId, companyId]);
    if (result.rows.length === 0) return errorResponse("Property not found", 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const body = await request.json();
    const { name, rut, address, commune, city, total_units, reserve_fund_pct, late_interest_pct, due_day, is_active } = body;
    const result = await query(
      `UPDATE condos_properties SET name = COALESCE($1, name), rut = COALESCE($2, rut), address = COALESCE($3, address), commune = COALESCE($4, commune), city = COALESCE($5, city), total_units = COALESCE($6, total_units), reserve_fund_pct = COALESCE($7, reserve_fund_pct), late_interest_pct = COALESCE($8, late_interest_pct), due_day = COALESCE($9, due_day), is_active = COALESCE($10, is_active), updated_at = now() WHERE id = $11 AND company_id = $12 RETURNING *`,
      [name, rut, address, commune, city, total_units, reserve_fund_pct, late_interest_pct, due_day, is_active, pParams.propertyId, companyId],
    );
    if (result.rows.length === 0) return errorResponse("Property not found", 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const result = await query(`DELETE FROM condos_properties WHERE id = $1 AND company_id = $2 RETURNING id`, [pParams.propertyId, companyId]);
    if (result.rows.length === 0) return errorResponse("Property not found", 404);
    return successResponse({ deleted: true });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

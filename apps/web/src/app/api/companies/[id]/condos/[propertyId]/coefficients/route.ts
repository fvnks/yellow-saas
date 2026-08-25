import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const result = await query(
      `SELECT cc.*, COALESCE(cc.coefficient_pct, cc.percentage, 0) as coefficient_pct, u.unit_number FROM condos_coefficients cc JOIN condos_units u ON u.id = cc.unit_id WHERE cc.company_id = $1 AND cc.property_id = $2 ORDER BY u.unit_number ASC`,
      [companyId, pParams.propertyId],
    );
    return successResponse(result.rows);
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
    const { coefficients } = body;
    if (!Array.isArray(coefficients)) return errorResponse("coefficients array is required", 400);

    for (const coeff of coefficients) {
      const pct = coeff.coefficient_pct ?? coeff.percentage;
      if (coeff.unit_id && pct !== undefined) {
        await query(
          `UPDATE condos_coefficients SET coefficient_pct = $1, percentage = $1, updated_at = now() WHERE unit_id = $2 AND company_id = $3 AND property_id = $4`,
          [pct, coeff.unit_id, companyId, pParams.propertyId],
        );
      }
    }
    const result = await query(
      `SELECT cc.*, COALESCE(cc.coefficient_pct, cc.percentage, 0) as coefficient_pct, u.unit_number FROM condos_coefficients cc JOIN condos_units u ON u.id = cc.unit_id WHERE cc.company_id = $1 AND cc.property_id = $2 ORDER BY u.unit_number ASC`,
      [companyId, pParams.propertyId],
    );
    return successResponse(result.rows);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

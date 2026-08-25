import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string; unitId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const result = await query(
      `SELECT u.*, c.name as owner_name, c.email as owner_email FROM condos_units u LEFT JOIN customers c ON c.id = u.owner_id WHERE u.id = $1 AND u.company_id = $2`,
      [pParams.unitId, companyId],
    );
    if (result.rows.length === 0) return errorResponse("Unit not found", 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string; unitId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const body = await request.json();
    const { unit_number, type, owner_id, resident_name, resident_email, resident_phone, notes } = body;
    const result = await query(
      `UPDATE condos_units SET unit_number = COALESCE($1, unit_number), type = COALESCE($2, type), owner_id = COALESCE($3, owner_id), resident_name = COALESCE($4, resident_name), resident_email = COALESCE($5, resident_email), resident_phone = COALESCE($6, resident_phone), notes = COALESCE($7, notes), updated_at = now() WHERE id = $8 AND company_id = $9 RETURNING *`,
      [unit_number, type, owner_id || null, resident_name, resident_email, resident_phone, notes, pParams.unitId, companyId],
    );
    if (result.rows.length === 0) return errorResponse("Unit not found", 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string; unitId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const result = await query(`DELETE FROM condos_units WHERE id = $1 AND company_id = $2 RETURNING id`, [pParams.unitId, companyId]);
    if (result.rows.length === 0) return errorResponse("Unit not found", 404);
    return successResponse({ deleted: true });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

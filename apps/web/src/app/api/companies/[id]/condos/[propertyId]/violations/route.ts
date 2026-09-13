import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);

    const violationsRes = await query(
      `SELECT v.id, v.unit_id as "unitId", u.unit_number as "unitNumber", u.resident_name as "ownerName",
              v.infraction_description as "description", v.fine_amount_clp as "amountCLP",
              v.fine_amount_uf as "amountUF", v.status, v.created_at as "createdAt"
       FROM condos_violations v
       JOIN condos_units u ON u.id = v.unit_id
       WHERE v.company_id = $1 AND v.property_id = $2
       ORDER BY v.created_at DESC`,
      [companyId, pParams.propertyId],
    );

    const policiesRes = await query(
      `SELECT id, insurer_name as "insurerName", policy_number as "policyNumber",
              start_date as "startDate", end_date as "endDate", fire_coverage_clp as "fireCoverageCLP",
              premium_amount_clp as "premiumAmountCLP"
       FROM condos_insurance_policies
       WHERE company_id = $1 AND property_id = $2`,
      [companyId, pParams.propertyId],
    );

    return successResponse({
      violations: violationsRes.rows,
      policies: policiesRes.rows,
    });
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
    const { type, unit_id, description, amount_clp, amount_uf, insurer_name, policy_number, fire_coverage_clp, premium_amount_clp } = body;

    if (type === 'policy') {
      const pRes = await query(
        `INSERT INTO condos_insurance_policies (company_id, property_id, insurer_name, policy_number, fire_coverage_clp, premium_amount_clp)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [companyId, pParams.propertyId, insurer_name, policy_number, Number(fire_coverage_clp) || 0, Number(premium_amount_clp) || 0],
      );
      return successResponse(pRes.rows[0], 201);
    }

    // Default: Add violation
    if (!unit_id || !description || !amount_clp) return errorResponse("unit_id, description and amount_clp are required", 400);

    // Verify unit belongs to this property
    const unitCheck = await query(
      `SELECT id FROM condos_units WHERE id = $1 AND company_id = $2 AND property_id = $3`,
      [unit_id, companyId, pParams.propertyId],
    );
    if (unitCheck.rows.length === 0) return errorResponse("Unit not found in this property", 404);

    const vRes = await query(
      `INSERT INTO condos_violations (company_id, property_id, unit_id, infraction_description, fine_amount_clp, fine_amount_uf, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [companyId, pParams.propertyId, unit_id, description, Number(amount_clp), Number(amount_uf) || 0],
    );

    return successResponse(vRes.rows[0], 201);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const body = await request.json();
    const { id, status, infraction_description, fine_amount_clp, fine_amount_uf } = body;

    if (!id) return errorResponse("id is required", 400);

    const result = await query(
      `UPDATE condos_violations SET
        status = COALESCE($1, status),
        infraction_description = COALESCE($2, infraction_description),
        fine_amount_clp = COALESCE($3, fine_amount_clp),
        fine_amount_uf = COALESCE($4, fine_amount_uf),
        updated_at = NOW()
       WHERE id = $5 AND company_id = $6 AND property_id = $7
       RETURNING *`,
      [status, infraction_description, fine_amount_clp ? Number(fine_amount_clp) : null, fine_amount_uf ? Number(fine_amount_uf) : null, id, companyId, pParams.propertyId]
    );

    if (result.rows.length === 0) return errorResponse("Multa no encontrada", 404);
    return successResponse(result.rows[0]);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return errorResponse("id query param is required", 400);

    const result = await query(
      `DELETE FROM condos_violations WHERE id = $1 AND company_id = $2 AND property_id = $3 RETURNING id`,
      [id, companyId, pParams.propertyId]
    );

    if (result.rows.length === 0) return errorResponse("Multa no encontrada", 404);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

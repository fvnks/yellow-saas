import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse, parseSearchParams, paginatedResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { page, limit, sort, order, offset } = parseSearchParams(request);
    const countResult = await query(
      `SELECT COUNT(*) FROM condos_payments cp JOIN condos_unit_statements cus ON cp.statement_id = cus.id WHERE cp.company_id = $1 AND cus.property_id = $2`,
      [companyId, pParams.propertyId],
    );
    const dataResult = await query(
      `SELECT cp.*, u.unit_number FROM condos_payments cp JOIN condos_unit_statements cus ON cp.statement_id = cus.id JOIN condos_units u ON u.id = cus.unit_id WHERE cp.company_id = $1 AND cus.property_id = $2 ORDER BY cp.payment_date DESC LIMIT $3 OFFSET $4`,
      [companyId, pParams.propertyId, limit, offset],
    );
    return paginatedResponse(dataResult.rows, parseInt(countResult.rows[0].count), page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string}> }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const body = await request.json();
    const { statement_id, amount, payment_date, payment_method, reference, notes } = body;
    if (!statement_id || !amount || !payment_date) return errorResponse("statement_id, amount and payment_date are required", 400);

    const stmtResult = await query(`SELECT * FROM condos_unit_statements WHERE id = $1 AND company_id = $2`, [statement_id, companyId]);
    if (stmtResult.rows.length === 0) return errorResponse("Statement not found", 404);

    const stmt = stmtResult.rows[0];
    const newPaid = parseFloat(stmt.amount_paid || "0") + parseFloat(amount);
    const total = parseFloat(stmt.total_amount || "0");
    const newStatus = newPaid >= total ? "paid" : newPaid > 0 ? "partial" : "pending";

    const amt = parseFloat(amount);
    const paymentResult = await query(
      `INSERT INTO condos_payments (company_id, statement_id, unit_id, amount, amount_clp, payment_date, payment_method, reference, reference_number, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [companyId, statement_id, stmt.unit_id, amt, Math.round(amt), payment_date, payment_method || "transfer", reference || null, reference || null, notes || null],
    );

    await query(`UPDATE condos_unit_statements SET amount_paid = $1, status = $2, updated_at = now() WHERE id = $3 AND company_id = $4`, [newPaid.toFixed(2), newStatus, statement_id, companyId]);

    return successResponse(paymentResult.rows[0], 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

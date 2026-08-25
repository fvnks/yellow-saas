import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string; periodId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const result = await query(
      `SELECT * FROM condos_expense_items WHERE company_id = $1 AND period_id = $2 ORDER BY created_at ASC`,
      [companyId, pParams.periodId],
    );
    return successResponse(result.rows);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string; periodId: string}> }) {
  try {
    const pParams = await params;
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const body = await request.json();
    const { name, category, description, amount } = body;
    if (!name || amount === undefined) return errorResponse("Name and amount are required", 400);
    const amt = parseFloat(amount || "0");
    const result = await query(
      `INSERT INTO condos_expense_items (company_id, property_id, period_id, name, category, description, amount, amount_clp) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [companyId, pParams.propertyId, pParams.periodId, name, category || "common", description || null, amt, Math.round(amt)],
    );
    return successResponse(result.rows[0], 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string; periodId: string}> }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const body = await request.json();
    const { itemId, name, category, description, amount } = body;
    if (!itemId) return errorResponse("itemId is required", 400);
    const amt = amount !== undefined ? parseFloat(amount) : undefined;
    const result = await query(
      `UPDATE condos_expense_items SET name = COALESCE($1, name), category = COALESCE($2, category), description = COALESCE($3, description), amount = COALESCE($4, amount), amount_clp = COALESCE($5, amount_clp), updated_at = now() WHERE id = $6 AND company_id = $7 RETURNING *`,
      [name, category, description, amt, amt !== undefined ? Math.round(amt) : undefined, itemId, companyId],
    );
    if (result.rows.length === 0) return errorResponse("Item not found", 404);
    return successResponse(result.rows[0]);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string; periodId: string}> }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) return errorResponse("itemId is required", 400);
    const result = await query(`DELETE FROM condos_expense_items WHERE id = $1 AND company_id = $2 RETURNING id`, [itemId, companyId]);
    if (result.rows.length === 0) return errorResponse("Item not found", 404);
    return successResponse({ deleted: true });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

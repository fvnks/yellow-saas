import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);

    const dtesRes = await query(
      `SELECT pi.id, pi.invoice_number, pi.supplier_id, s.name as supplier_name,
              pi.total_amount, pi.invoice_date, pi.notes
       FROM purchase_invoices pi
       LEFT JOIN suppliers s ON s.id = pi.supplier_id
       WHERE pi.company_id = $1
       ORDER BY pi.invoice_date DESC
       LIMIT 30`,
      [companyId],
    );

    return successResponse(dtesRes.rows);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

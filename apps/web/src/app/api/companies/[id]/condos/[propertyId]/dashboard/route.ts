import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string }> }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Unauthorized", 401);
    const { propertyId } = await params;

    const [unitsRes, periodsRes, paymentsRes, propertyRes, expensesRes] = await Promise.all([
      query(
        `SELECT u.*, COALESCE(cc.coefficient_pct, cc.percentage, 0) as coefficient_pct,
                COALESCE(o.full_name, u.resident_name) as owner_name
         FROM condos_units u
         LEFT JOIN condos_coefficients cc ON cc.unit_id = u.id AND cc.category = 'general'
         LEFT JOIN owners o ON o.id = u.owner_id
         WHERE u.company_id = $1 AND u.property_id = $2
         ORDER BY u.unit_number`,
        [companyId, propertyId],
      ),
      query(
        `SELECT * FROM condos_periods WHERE company_id = $1 AND property_id = $2 ORDER BY period_date DESC`,
        [companyId, propertyId],
      ),
      query(
        `SELECT p.*, u.unit_number, COALESCE(o.full_name, u.resident_name, 'Copropietario') as owner_name
         FROM condos_payments p
         JOIN condos_units u ON u.id = p.unit_id
         LEFT JOIN owners o ON o.id = u.owner_id
         WHERE p.company_id = $1 AND u.property_id = $2
         ORDER BY p.payment_date DESC`,
        [companyId, propertyId],
      ),
      query(`SELECT * FROM condos_properties WHERE id = $1 AND company_id = $2`, [propertyId, companyId]),
      query(
        `SELECT COALESCE(SUM(e.amount), 0) as total FROM condos_expense_items e
         JOIN condos_periods p ON p.id = e.period_id
         WHERE e.company_id = $1 AND p.property_id = $2`,
        [companyId, propertyId],
      ),
    ]);

    const property = propertyRes.rows[0];
    const totalCollected = paymentsRes.rows.reduce((sum: number, p: any) => sum + parseFloat(p.amount || "0"), 0);
    const totalExpenses = parseFloat(expensesRes.rows[0]?.total || "0");
    const totalDebt = unitsRes.rows.reduce((sum: number, u: any) => sum + parseFloat(u.unpaid_balance || "0"), 0);

    return successResponse({
      propertyId,
      propertyName: property?.name || "",
      units: unitsRes.rows.map((u: any) => ({
        id: u.id,
        number: u.unit_number,
        type: u.type,
        ownerName: u.owner_name || "Sin propietario",
        ownerEmail: u.resident_email || "",
        ownerPhone: u.resident_phone || "",
        alicuotaPercentage: parseFloat(u.coefficient_pct || "0"),
        unpaidBalanceCLP: parseFloat(u.unpaid_balance || "0"),
        status: parseFloat(u.unpaid_balance || "0") > 0 ? "pendiente" : "al_dia",
      })),
      periods: periodsRes.rows.map((p: any) => ({
        id: p.id,
        periodName: p.period_name || "",
        periodDate: p.period_date,
        dueDate: p.due_date,
        status: p.status,
        reserveFundPercentage: parseFloat(p.reserve_fund_pct || "0"),
        lateInterestRate: parseFloat(p.late_interest_pct || "0"),
        totalExpensesCLP: parseFloat(p.total_amount || "0"),
      })),
      payments: paymentsRes.rows.map((pay: any) => ({
        id: pay.id,
        unitId: pay.unit_id,
        unitNumber: pay.unit_number || "",
        ownerName: pay.owner_name || "Copropietario",
        periodId: pay.period_id,
        amountCLP: parseFloat(pay.amount || "0"),
        paymentDate: pay.payment_date ? String(pay.payment_date).substring(0, 10) : "",
        paymentMethod: pay.payment_method || "",
        referenceNumber: pay.reference_number || "",
        notes: pay.notes,
      })),
      summary: {
        totalUnits: unitsRes.rows.length,
        totalExpensesCLP: totalExpenses,
        totalCollectedCLP: totalCollected,
        totalDebtCLP: totalDebt,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return errorResponse("Internal server error", 500);
  }
}

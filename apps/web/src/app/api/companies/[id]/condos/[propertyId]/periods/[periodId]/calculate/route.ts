import { query } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string; periodId: string}> }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { propertyId, periodId } = await params;

    const periodCheck = await query(
      `SELECT * FROM condos_periods WHERE id = $1 AND company_id = $2 AND property_id = $3`,
      [periodId, companyId, propertyId],
    );
    if (periodCheck.rows.length === 0) return errorResponse("Period not found", 404);

    await query(`DELETE FROM condos_unit_statements WHERE company_id = $1 AND period_id = $2`, [companyId, periodId]);

    const itemsResult = await query(
      `SELECT * FROM condos_expense_items WHERE company_id = $1 AND period_id = $2`,
      [companyId, periodId],
    );
    const totalExpenses = itemsResult.rows.reduce((acc: number, item: any) => acc + parseFloat(item.amount || "0"), 0);

    const unitsResult = await query(
      `SELECT u.id as unit_id, u.unit_number, COALESCE(cc.coefficient_pct, cc.percentage, 0) as coefficient_pct FROM condos_units u LEFT JOIN condos_coefficients cc ON cc.unit_id = u.id AND cc.category = 'general' WHERE u.company_id = $1 AND u.property_id = $2`,
      [companyId, propertyId],
    );
    const propertyResult = await query(`SELECT * FROM condos_properties WHERE id = $1 AND company_id = $2`, [propertyId, companyId]);
    const property = propertyResult.rows[0];
    const reservePct = parseFloat(property?.reserve_fund_pct || "0");

    const statements = [];
    for (const unitRow of unitsResult.rows) {
      const pct = parseFloat(unitRow.coefficient_pct || "0");
      const commonExpense = totalExpenses * (pct / 100);
      const reserveFund = commonExpense * (reservePct / 100);
      const totalAmount = commonExpense + reserveFund;

      const stmtResult = await query(
        `INSERT INTO condos_unit_statements (company_id, property_id, unit_id, period_id, coefficient_pct, common_expense, reserve_fund, total_amount, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [companyId, propertyId, unitRow.unit_id, periodId, pct, commonExpense.toFixed(2), reserveFund.toFixed(2), totalAmount.toFixed(2), "pending"],
      );
      statements.push(stmtResult.rows[0]);
    }

    await query(`UPDATE condos_periods SET status = 'calculated', calculated_at = now(), total_amount = $1 WHERE id = $2 AND company_id = $3`, [totalExpenses.toFixed(2), periodId, companyId]);

    return successResponse({ total_expenses: totalExpenses, statements, units_count: statements.length });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

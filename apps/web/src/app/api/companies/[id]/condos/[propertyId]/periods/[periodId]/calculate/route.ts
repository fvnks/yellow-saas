import { query, transaction } from "@/api/lib/db";
import { getCompanyId, successResponse, errorResponse } from "@/api/lib/helpers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; propertyId: string; periodId: string}> }) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse("Company ID not found", 400);
    const { propertyId, periodId } = await params;

    const result = await transaction(async (client) => {
      const periodCheck = await client.query(
        `SELECT * FROM condos_periods WHERE id = $1 AND company_id = $2 AND property_id = $3`,
        [periodId, companyId, propertyId],
      );
      if (periodCheck.rows.length === 0) throw new Error('Período no encontrado');

      await client.query(`DELETE FROM condos_unit_statements WHERE company_id = $1 AND period_id = $2`, [companyId, periodId]);

      const itemsResult = await client.query(
        `SELECT * FROM condos_expense_items WHERE company_id = $1 AND period_id = $2`,
        [companyId, periodId],
      );
      const totalExpenses = itemsResult.rows.reduce((acc: number, item: any) => acc + parseFloat(item.amount || "0"), 0);

      // Group expenses by category
      const expensesByCategory: Record<string, number> = {};
      for (const item of itemsResult.rows) {
        const cat = item.coefficient_category || 'general';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + parseFloat(item.amount || "0");
      }

      // Fetch all units with their coefficients and unpaid balance
      const unitsResult = await client.query(
        `SELECT u.id as unit_id, u.unit_number, u.unpaid_balance,
                COALESCE(
                  (SELECT json_object_agg(category, COALESCE(coefficient_pct, percentage, 0))
                   FROM condos_coefficients WHERE unit_id = u.id),
                  '{}'::json
                ) as coefficients
         FROM condos_units u
         WHERE u.company_id = $1 AND u.property_id = $2`,
        [companyId, propertyId],
      );

      const propertyResult = await client.query(`SELECT * FROM condos_properties WHERE id = $1 AND company_id = $2`, [propertyId, companyId]);
      const property = propertyResult.rows[0];
      const reservePct = parseFloat(property?.reserve_fund_pct || "0");
      const lateInterestRate = parseFloat(property?.late_interest_pct || "1.5");

      const statements = [];
      for (const unitRow of unitsResult.rows) {
        const coeffs = unitRow.coefficients || {};
        const generalPct = parseFloat(coeffs['general'] || "0");

        // Calculate prorated expense across categories
        let unitCommonExpense = 0;
        for (const [cat, catTotal] of Object.entries(expensesByCategory)) {
          const catPct = parseFloat(coeffs[cat] || generalPct);
          unitCommonExpense += catTotal * (catPct / 100);
        }

        // If no categorized breakdown, fall back to general
        if (Object.keys(expensesByCategory).length === 0) {
          unitCommonExpense = totalExpenses * (generalPct / 100);
        }

        const reserveFund = unitCommonExpense * (reservePct / 100);

        // Previous unpaid balance & late interest
        const unpaidPrev = Math.max(0, parseFloat(unitRow.unpaid_balance || "0"));
        const lateInterest = unpaidPrev > 0 ? Math.round(unpaidPrev * (lateInterestRate / 100)) : 0;
        const totalAmount = unitCommonExpense + reserveFund + lateInterest + unpaidPrev;

        const stmtResult = await client.query(
          `INSERT INTO condos_unit_statements (
             company_id, property_id, unit_id, period_id, coefficient_pct,
             common_expense, reserve_fund, previous_debt_clp, late_interest_clp,
             total_amount, total_clp, status
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
          [
            companyId, propertyId, unitRow.unit_id, periodId, generalPct,
            unitCommonExpense.toFixed(2), reserveFund.toFixed(2),
            Math.round(unpaidPrev), lateInterest,
            totalAmount.toFixed(2), Math.round(totalAmount), "pending"
          ],
        );
        statements.push(stmtResult.rows[0]);
      }

      await client.query(`UPDATE condos_periods SET status = 'calculated', calculated_at = now(), total_amount = $1 WHERE id = $2 AND company_id = $3`, [totalExpenses.toFixed(2), periodId, companyId]);

      return { total_expenses: totalExpenses, statements, units_count: statements.length };
    });

    return successResponse(result);
  } catch (err) {
    console.error('Route error:', err);
    return errorResponse('Internal server error', 500);
  }
}

import { NextResponse } from 'next/server';
import { query, transaction } from '@/api/lib/db';

// POST: Create or Calculate period statements
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, company_id, property_id, period_name, period_date, due_date, reserve_fund_pct, late_interest_pct, period_id } = body;
    const companyId = company_id || '00000000-0000-0000-0000-000000000001';

    if (action === 'calculate') {
      if (!period_id) {
        return NextResponse.json({ success: false, error: 'period_id es requerido para calcular' }, { status: 400 });
      }

      await transaction(async (client) => {
        // Fetch period total expenses
        const pRes = await client.query('SELECT * FROM condos_periods WHERE id = $1', [period_id]);
        if (pRes.rows.length === 0) throw new Error('Período no encontrado');
        const period = pRes.rows[0];
        const propId = period.property_id;
        const totalExpenses = Number(period.total_expenses_clp) || 0;

        // Fetch property parameters
        const propRes = await client.query('SELECT reserve_fund_pct, late_interest_pct FROM condos_properties WHERE id = $1', [propId]);
        const resFundPct = Number(propRes.rows[0]?.reserve_fund_pct || 5.0);
        const interestPct = Number(propRes.rows[0]?.late_interest_pct || 1.5);

        // Fetch all units with general coefficient
        const unitsRes = await client.query(
          `SELECT u.id, COALESCE(c.coefficient_pct, c.percentage, 0) as coefficient_pct
           FROM condos_units u
           LEFT JOIN condos_coefficients c ON c.unit_id = u.id AND c.category = 'general'
           WHERE u.company_id = $1 AND u.property_id = $2`,
          [companyId, propId]
        );

        for (const u of unitsRes.rows) {
          const coeff = Number(u.coefficient_pct) || 0;
          const baseExpense = Math.round(totalExpenses * (coeff / 100));
          const reserveFund = Math.round(baseExpense * (resFundPct / 100));

          // Calculate previous debt and interest
          const debtRes = await client.query(
            `SELECT COALESCE(SUM(total_amount - amount_paid), 0) as debt
             FROM condos_unit_statements
             WHERE unit_id = $1 AND period_id != $2 AND status != 'paid'`,
            [u.id, period_id]
          );
          const previousDebt = Number(debtRes.rows[0]?.debt || 0);
          const lateInterest = previousDebt > 0 ? Math.round(previousDebt * (interestPct / 100)) : 0;
          const totalToPay = baseExpense + reserveFund + previousDebt + lateInterest;

          await client.query(
            `INSERT INTO condos_unit_statements (
               company_id, property_id, period_id, unit_id, coefficient_pct,
               common_expense, reserve_fund, previous_debt_clp, late_interest_clp,
               base_expense_clp, reserve_fund_clp, total_amount, total_clp, status
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $6, $7, $10, $10, 'pending')
             ON CONFLICT (period_id, unit_id)
             DO UPDATE SET
               coefficient_pct = EXCLUDED.coefficient_pct,
               common_expense = EXCLUDED.common_expense,
               reserve_fund = EXCLUDED.reserve_fund,
               previous_debt_clp = EXCLUDED.previous_debt_clp,
               late_interest_clp = EXCLUDED.late_interest_clp,
               base_expense_clp = EXCLUDED.base_expense_clp,
               reserve_fund_clp = EXCLUDED.reserve_fund_clp,
               total_amount = EXCLUDED.total_amount,
               total_clp = EXCLUDED.total_clp,
               updated_at = now()`,
            [companyId, propId, period_id, u.id, coeff, baseExpense, reserveFund, previousDebt, lateInterest, totalToPay]
          );
        }

        // Update period status
        await client.query(
          `UPDATE condos_periods
           SET status = 'issued', calculated_at = now(), updated_at = now()
           WHERE id = $1`,
          [period_id]
        );
      });

      return NextResponse.json({ success: true, message: 'Liquidación y colillas calculadas exitosamente' });
    }

    // Default: Create new period
    const result = await transaction(async (client) => {
      let propId = property_id;
      if (!propId) {
        const propRes = await client.query('SELECT id FROM condos_properties WHERE company_id = $1 LIMIT 1', [companyId]);
        if (propRes.rows.length === 0) throw new Error('Condominio no configurado');
        propId = propRes.rows[0].id;
      }

      const pRes = await client.query(
        `INSERT INTO condos_periods (company_id, property_id, period_code, period_date, due_date, status)
         VALUES ($1, $2, $3, $4, $5, 'draft')
         RETURNING *`,
        [companyId, propId, period_name || 'Nuevo Período', period_date || new Date().toISOString().substring(0, 7), due_date || null]
      );
      return pRes.rows[0];
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in POST /api/condominio/periods:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error al procesar período' }, { status: 500 });
  }
}

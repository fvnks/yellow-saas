import { query } from '@/api/lib/db';
import { getCompanyId, successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';
import {
  calculateEmployeePayroll,
  getPayrollSummary,
  setUFValue,
  Employee,
  PayrollItem,
} from '@/lib/payroll';

interface EmployeeExtras {
  employee_id: string;
  overtime_hours?: number;
  bonuses?: { concept: string; amount: number; taxable: boolean }[];
  deductions?: { concept: string; amount: number }[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return errorResponse('Company ID not found', 400);

    const body = await request.json();
    const { run_id, extras } = body as { run_id: string; extras?: EmployeeExtras[] };

    if (!run_id) return errorResponse('run_id is required', 400);

    // Get the payroll run
    const { rows: runRows } = await query(
      `SELECT * FROM payroll_runs WHERE id = $1 AND company_id = $2`,
      [run_id, companyId]
    );
    if (!runRows[0]) return errorResponse('Payroll run not found', 404);

    const run = runRows[0];
    if (run.status !== 'draft') {
      return errorResponse('Solo se puede calcular nomina en estado borrador', 400);
    }

    // Fetch UF value from company settings
    try {
      const { rows: ufRows } = await query(
        `SELECT setting_value FROM company_settings
         WHERE company_id = $1 AND setting_key = 'uf_value'`,
        [companyId]
      );
      if (ufRows[0]) {
        setUFValue(parseFloat(ufRows[0].setting_value));
      }
    } catch {
      // company_settings may not exist yet, use default
    }

    const periodStart = new Date(run.period_start);
    const periodEnd = new Date(run.period_end);

    // Get active employees
    const { rows: employeeRows } = await query(
      `SELECT * FROM employees WHERE company_id = $1 AND status = 'active'`,
      [companyId]
    );

    if (employeeRows.length === 0) {
      return errorResponse('No hay empleados activos para calcular', 400);
    }

    // Build extras lookup
    const extrasMap = new Map<string, EmployeeExtras>();
    if (extras && Array.isArray(extras)) {
      for (const ex of extras) {
        extrasMap.set(ex.employee_id, ex);
      }
    }

    // Calculate payroll for each employee with extras
    const results = employeeRows.map((emp: Employee) => {
      const empExtras = extrasMap.get(emp.id);
      return calculateEmployeePayroll(emp, periodStart, periodEnd, empExtras ? {
        overtime_hours: empExtras.overtime_hours,
        bonuses: empExtras.bonuses,
        deductions: empExtras.deductions,
      } : undefined);
    });

    const summary = getPayrollSummary(results);

    // Delete existing items (recalculate)
    await query(`DELETE FROM payroll_items WHERE run_id = $1`, [run_id]);

    // Insert all payroll items
    for (const result of results) {
      for (const item of result.items) {
        await query(
          `INSERT INTO payroll_items
            (company_id, run_id, employee_id, type, concept, code, amount, quantity, unit_value, is_taxable, is_employer, category)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            companyId,
            run_id,
            result.employee_id,
            item.type,
            item.concept,
            item.code,
            item.amount,
            item.quantity,
            item.unit_value,
            item.is_taxable,
            item.is_employer,
            item.category,
          ]
        );
      }
    }

    // Store extras JSON on the run for future reference
    if (extras && extras.length > 0) {
      await query(
        `UPDATE payroll_runs SET notes = COALESCE(notes || E'\n', '') || $1 WHERE id = $2`,
        [`Extras: ${JSON.stringify(extras)}`, run_id]
      );
    }

    // Update the run with totals
    await query(
      `UPDATE payroll_runs SET
        status = 'calculated',
        employee_count = $1,
        gross_amount = $2,
        total_deductions = $3,
        total_employer = $4,
        total_tax = $5,
        net_amount = $6,
        total_amount = $7,
        updated_at = NOW()
       WHERE id = $8`,
      [
        summary.employee_count,
        summary.gross_amount,
        summary.total_deductions,
        summary.total_employer,
        summary.total_tax,
        summary.net_amount,
        summary.gross_amount + summary.total_employer,
        run_id,
      ]
    );

    return successResponse({
      run_id,
      summary,
      employee_count: results.length,
    });
  } catch (e: any) {
    return errorResponse(`Error calculating payroll: ${e.message}`, 500);
  }
}

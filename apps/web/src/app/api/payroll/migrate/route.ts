import { query } from '@/api/lib/db';
import { successResponse, errorResponse } from '@/api/lib/helpers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const results: string[] = [];

    // ── employees: add Chilean columns ──
    const employeeCols = [
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS rut TEXT`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_code TEXT`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS birth_date DATE`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS termination_date DATE`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'indefinido'`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary_frequency TEXT DEFAULT 'monthly'`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_account TEXT`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_name TEXT`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS tax_id TEXT`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS afp_id TEXT`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS afp_rate DECIMAL(5,2) DEFAULT 10`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS afp_fund TEXT DEFAULT 'AFP Habitat'`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_id TEXT`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_type TEXT DEFAULT 'fonasa' CHECK (health_type IN ('fonasa', 'isapre'))`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_plan TEXT`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_amount DECIMAL(14,2) DEFAULT 0`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS mutual_type TEXT DEFAULT 'achs'`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS mutual_rate DECIMAL(5,2) DEFAULT 0.93`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS apv_amount DECIMAL(14,2) DEFAULT 0`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS afp_commission DECIMAL(14,2) DEFAULT 0`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS address TEXT`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact TEXT`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_phone TEXT`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS notes TEXT`,
      `ALTER TABLE employees ADD COLUMN IF NOT EXISTS image_url TEXT`,
    ];

    for (const sql of employeeCols) {
      try { await query(sql); results.push(`OK: ${sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1] || 'col'}`); } catch (e: any) { results.push(`SKIP: ${e.message}`); }
    }

    // Fix contract_type CHECK if needed
    try {
      await query(`ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_contract_type_check`);
      await query(`ALTER TABLE employees ADD CONSTRAINT employees_contract_type_check CHECK (contract_type IN ('indefinido', 'plazo_fijo', 'part_time', 'temporada', 'boleta_7a'))`);
      results.push('OK: contract_type CHECK updated');
    } catch (e: any) { results.push(`SKIP contract_type CHECK: ${e.message}`); }

    // ── payroll_runs: add summary columns ──
    const runCols = [
      `ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS period_label TEXT`,
      `ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS employee_count INTEGER DEFAULT 0`,
      `ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS gross_amount DECIMAL(14,2) DEFAULT 0`,
      `ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS total_deductions DECIMAL(14,2) DEFAULT 0`,
      `ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS total_employer DECIMAL(14,2) DEFAULT 0`,
      `ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS total_tax DECIMAL(14,2) DEFAULT 0`,
      `ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS net_amount DECIMAL(14,2) DEFAULT 0`,
      `ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ`,
    ];

    for (const sql of runCols) {
      try { await query(sql); results.push(`OK: ${sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1] || 'col'}`); } catch (e: any) { results.push(`SKIP: ${e.message}`); }
    }

    // ── payroll_items: add detail columns ──
    const itemCols = [
      `ALTER TABLE payroll_items ADD COLUMN IF NOT EXISTS code TEXT`,
      `ALTER TABLE payroll_items ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2) DEFAULT 1`,
      `ALTER TABLE payroll_items ADD COLUMN IF NOT EXISTS unit_value DECIMAL(14,2) DEFAULT 0`,
      `ALTER TABLE payroll_items ADD COLUMN IF NOT EXISTS is_employer BOOLEAN DEFAULT false`,
      `ALTER TABLE payroll_items ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'earning'`,
      `ALTER TABLE payroll_items ADD COLUMN IF NOT EXISTS employee_id_ref UUID`,
    ];

    for (const sql of itemCols) {
      try { await query(sql); results.push(`OK: ${sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1] || 'col'}`); } catch (e: any) { results.push(`SKIP: ${e.message}`); }
    }

    // ── Indexes ──
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id)`,
      `CREATE INDEX IF NOT EXISTS idx_employees_rut ON employees(company_id, rut)`,
      `CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(company_id, status)`,
      `CREATE INDEX IF NOT EXISTS idx_payroll_runs_company ON payroll_runs(company_id)`,
      `CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON payroll_runs(company_id, period_start, period_end)`,
      `CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON payroll_items(run_id)`,
      `CREATE INDEX IF NOT EXISTS idx_payroll_items_employee ON payroll_items(employee_id)`,
      `CREATE INDEX IF NOT EXISTS idx_payroll_items_company ON payroll_items(company_id)`,
    ];

    for (const sql of indexes) {
      try { await query(sql); results.push(`OK: ${sql.match(/idx_\w+/)?.[0] || 'index'}`); } catch (e: any) { results.push(`SKIP: ${e.message}`); }
    }

    // ── RLS policies ──
    const rlsPolicies = [
      `ALTER TABLE employees ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY`,
      `DROP POLICY IF EXISTS employees_company_policy ON employees`,
      `CREATE POLICY employees_company_policy ON employees FOR ALL USING (company_id = current_company_id())`,
      `DROP POLICY IF EXISTS payroll_runs_company_policy ON payroll_runs`,
      `CREATE POLICY payroll_runs_company_policy ON payroll_runs FOR ALL USING (company_id = current_company_id())`,
      `DROP POLICY IF EXISTS payroll_items_company_policy ON payroll_items`,
      `CREATE POLICY payroll_items_company_policy ON payroll_items FOR ALL USING (company_id = current_company_id())`,
    ];

    for (const sql of rlsPolicies) {
      try { await query(sql); results.push(`OK: ${sql.match(/POLICY \w+|ENABLE ROW LEVEL/)?.[0] || 'rls'}`); } catch (e: any) { results.push(`SKIP: ${e.message}`); }
    }

    return successResponse({ message: 'Payroll schema migration completed', results });
  } catch (e: any) {
    return errorResponse(`Migration failed: ${e.message}`, 500);
  }
}

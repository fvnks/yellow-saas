-- Migration 100: Complete payroll, attendance & vacation schema
-- Consolidates all columns/tables/indexes/RLS previously only available
-- via the ad-hoc POST /api/payroll/migrate endpoint.

-- ══════════════════════════════════════════
-- EMPLOYEES — Chilean payroll columns
-- ══════════════════════════════════════════
ALTER TABLE employees ADD COLUMN IF NOT EXISTS rut TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_code TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS termination_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'indefinido';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary_frequency TEXT DEFAULT 'monthly';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS afp_id TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS afp_rate DECIMAL(5,2) DEFAULT 10;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS afp_fund TEXT DEFAULT 'AFP Habitat';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_id TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_type TEXT DEFAULT 'fonasa' CHECK (health_type IN ('fonasa', 'isapre'));
ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_plan TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS health_amount DECIMAL(14,2) DEFAULT 0;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS mutual_type TEXT DEFAULT 'achs';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS mutual_rate DECIMAL(5,2) DEFAULT 0.93;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS apv_amount DECIMAL(14,2) DEFAULT 0;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS afp_commission DECIMAL(14,2) DEFAULT 0;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_phone TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Fix contract_type CHECK
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_contract_type_check;
ALTER TABLE employees ADD CONSTRAINT employees_contract_type_check
  CHECK (contract_type IN ('indefinido', 'plazo_fijo', 'part_time', 'temporada', 'boleta_7a'));

-- ══════════════════════════════════════════
-- PAYROLL_RUNS — summary columns
-- ══════════════════════════════════════════
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS period_label TEXT;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS employee_count INTEGER DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS gross_amount DECIMAL(14,2) DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS total_deductions DECIMAL(14,2) DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS total_employer DECIMAL(14,2) DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS total_tax DECIMAL(14,2) DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS net_amount DECIMAL(14,2) DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- ══════════════════════════════════════════
-- PAYROLL_ITEMS — detail columns
-- ══════════════════════════════════════════
ALTER TABLE payroll_items ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE payroll_items ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2) DEFAULT 1;
ALTER TABLE payroll_items ADD COLUMN IF NOT EXISTS unit_value DECIMAL(14,2) DEFAULT 0;
ALTER TABLE payroll_items ADD COLUMN IF NOT EXISTS is_employer BOOLEAN DEFAULT false;
ALTER TABLE payroll_items ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'earning';
ALTER TABLE payroll_items ADD COLUMN IF NOT EXISTS employee_id_ref UUID;

-- ══════════════════════════════════════════
-- INDEXES — employees, payroll
-- ══════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_rut ON employees(company_id, rut);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(company_id, status);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_company ON payroll_runs(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON payroll_runs(company_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON payroll_items(run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee ON payroll_items(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_company ON payroll_items(company_id);

-- ══════════════════════════════════════════
-- RLS — employees, payroll
-- ══════════════════════════════════════════
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS employees_company_policy ON employees;
CREATE POLICY employees_company_policy ON employees FOR ALL
  USING (company_id = current_company_id());

DROP POLICY IF EXISTS payroll_runs_company_policy ON payroll_runs;
CREATE POLICY payroll_runs_company_policy ON payroll_runs FOR ALL
  USING (company_id = current_company_id());

DROP POLICY IF EXISTS payroll_items_company_policy ON payroll_items;
CREATE POLICY payroll_items_company_policy ON payroll_items FOR ALL
  USING (company_id = current_company_id());

-- ══════════════════════════════════════════
-- VACATION BALANCES
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vacation_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  days_earned DECIMAL(5,1) DEFAULT 0,
  days_used DECIMAL(5,1) DEFAULT 0,
  days_pending DECIMAL(5,1) DEFAULT 0,
  days_available DECIMAL(5,1) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (company_id, employee_id, year)
);

-- ══════════════════════════════════════════
-- VACATION REQUESTS
-- ══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vacation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days DECIMAL(5,1) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════
-- INDEXES — vacation
-- ══════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_vacation_balances_employee ON vacation_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_vacation_balances_company ON vacation_balances(company_id);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_employee ON vacation_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_company ON vacation_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_status ON vacation_requests(company_id, status);

-- ══════════════════════════════════════════
-- RLS — vacation
-- ══════════════════════════════════════════
ALTER TABLE vacation_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vacation_balances_company_policy ON vacation_balances;
CREATE POLICY vacation_balances_company_policy ON vacation_balances FOR ALL
  USING (company_id = current_company_id());

DROP POLICY IF EXISTS vacation_requests_company_policy ON vacation_requests;
CREATE POLICY vacation_requests_company_policy ON vacation_requests FOR ALL
  USING (company_id = current_company_id());

-- =====================================================
-- YELLOW ERP: Projects Module Extension
-- Milestones, Timesheets, Expenses, Costs, Documents
-- =====================================================

-- =====================================================
-- 1. PROJECT MILESTONES
-- =====================================================
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_milestones_company ON project_milestones(company_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON project_milestones(project_id);

ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones_company_isolation" ON project_milestones
  USING (company_id = current_setting('app.current_company_id')::uuid);

-- =====================================================
-- 2. PROJECT TIMESHEETS
-- =====================================================
CREATE TABLE IF NOT EXISTS project_timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  hours DECIMAL(5,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  description TEXT,
  billable BOOLEAN DEFAULT true,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_timesheets_company ON project_timesheets(company_id);
CREATE INDEX IF NOT EXISTS idx_project_timesheets_project ON project_timesheets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_timesheets_employee ON project_timesheets(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_timesheets_date ON project_timesheets(date);

ALTER TABLE project_timesheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timesheets_company_isolation" ON project_timesheets
  USING (company_id = current_setting('app.current_company_id')::uuid);

-- =====================================================
-- 3. PROJECT EXPENSES (direct expenses: travel, services, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS project_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('travel', 'materials', 'services', 'equipment', 'subcontract', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL(14,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'CLP',
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  invoice_number TEXT,
  supplier_name TEXT,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_expenses_company ON project_expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_project_expenses_project ON project_expenses(project_id);

ALTER TABLE project_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses_company_isolation" ON project_expenses
  USING (company_id = current_setting('app.current_company_id')::uuid);

-- =====================================================
-- 4. PROJECT COSTS (aggregated costs from purchases, inventory, payroll)
-- =====================================================
CREATE TABLE IF NOT EXISTS project_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('purchase', 'inventory', 'payroll', 'expense', 'manual')),
  source_id UUID,
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(14,2) NOT NULL,
  cost_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_costs_company ON project_costs(company_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_project ON project_costs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_source ON project_costs(source_type, source_id);

ALTER TABLE project_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "costs_company_isolation" ON project_costs
  USING (company_id = current_setting('app.current_company_id')::uuid);

-- =====================================================
-- 5. PROJECT DOCUMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  category TEXT DEFAULT 'other' CHECK (category IN ('contract', 'specification', 'invoice', 'photo', 'report', 'other')),
  description TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_documents_company ON project_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents(project_id);

ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_company_isolation" ON project_documents
  USING (company_id = current_setting('app.current_company_id')::uuid);

-- =====================================================
-- 6. UPDATE TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_project_milestones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_milestones_updated_at
  BEFORE UPDATE ON project_milestones
  FOR EACH ROW EXECUTE FUNCTION update_project_milestones_updated_at();

CREATE OR REPLACE FUNCTION update_project_timesheets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_timesheets_updated_at
  BEFORE UPDATE ON project_timesheets
  FOR EACH ROW EXECUTE FUNCTION update_project_timesheets_updated_at();

CREATE OR REPLACE FUNCTION update_project_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_expenses_updated_at
  BEFORE UPDATE ON project_expenses
  FOR EACH ROW EXECUTE FUNCTION update_project_expenses_updated_at();

CREATE TABLE IF NOT EXISTS project_resource_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  allocation_percent INTEGER DEFAULT 100 CHECK (allocation_percent BETWEEN 0 AND 100),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  role_in_project TEXT,
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_allocations_company ON project_resource_allocations(company_id);
CREATE INDEX IF NOT EXISTS idx_allocations_employee ON project_resource_allocations(employee_id);
CREATE INDEX IF NOT EXISTS idx_allocations_project ON project_resource_allocations(project_id);

ALTER TABLE project_resource_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allocations_company_isolation" ON project_resource_allocations
  USING (company_id = current_setting('app.current_company_id')::uuid);

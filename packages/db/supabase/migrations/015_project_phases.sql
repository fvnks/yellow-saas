CREATE TABLE IF NOT EXISTS project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(12,2) DEFAULT 0,
  spent DECIMAL(12,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_phases_company ON project_phases(company_id);
CREATE INDEX IF NOT EXISTS idx_project_phases_project ON project_phases(project_id);

ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "phases_company_isolation" ON project_phases
  USING (company_id = current_setting('app.current_company_id')::uuid);

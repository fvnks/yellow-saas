-- 009_project_risks.sql
-- Risk management for projects

CREATE TABLE IF NOT EXISTS project_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  probability TEXT NOT NULL DEFAULT 'medium' CHECK (probability IN ('low', 'medium', 'high')),
  impact TEXT NOT NULL DEFAULT 'medium' CHECK (impact IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'mitigating', 'closed', 'realized')),
  mitigation_plan TEXT,
  owner_id UUID REFERENCES profiles(id),
  identified_date DATE DEFAULT CURRENT_DATE,
  resolved_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_risks_company ON project_risks(company_id);
CREATE INDEX IF NOT EXISTS idx_project_risks_project ON project_risks(project_id);

ALTER TABLE project_risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "risks_company_isolation" ON project_risks
  USING (company_id = current_setting('app.current_company_id')::uuid);

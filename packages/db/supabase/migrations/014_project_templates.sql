CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_template_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_hours DECIMAL(6,2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_template_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_templates_company ON project_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_project_template_tasks_company ON project_template_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_project_template_tasks_template ON project_template_tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_project_template_milestones_company ON project_template_milestones(company_id);
CREATE INDEX IF NOT EXISTS idx_project_template_milestones_template ON project_template_milestones(template_id);

ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_company_isolation" ON project_templates
  USING (company_id = current_setting('app.current_company_id')::uuid);

ALTER TABLE project_template_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "template_tasks_company_isolation" ON project_template_tasks
  USING (company_id = current_setting('app.current_company_id')::uuid);

ALTER TABLE project_template_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "template_milestones_company_isolation" ON project_template_milestones
  USING (company_id = current_setting('app.current_company_id')::uuid);

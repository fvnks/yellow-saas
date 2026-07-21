-- Custom field definitions per project
CREATE TABLE IF NOT EXISTS project_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'boolean')),
  options JSONB DEFAULT '[]'::jsonb,
  required BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom field values per task
CREATE TABLE IF NOT EXISTS project_task_custom_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES project_custom_fields(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, field_id)
);

CREATE INDEX IF NOT EXISTS idx_custom_fields_project ON project_custom_fields(project_id);
CREATE INDEX IF NOT EXISTS idx_custom_values_task ON project_task_custom_values(task_id);
CREATE INDEX IF NOT EXISTS idx_custom_values_company ON project_task_custom_values(company_id);

ALTER TABLE project_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_task_custom_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "custom_fields_company_isolation" ON project_custom_fields
  FOR ALL USING (company_id = current_company_id());

CREATE POLICY "custom_values_company_isolation" ON project_task_custom_values
  FOR ALL USING (company_id = current_company_id());

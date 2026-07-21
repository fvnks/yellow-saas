-- Task checklists
CREATE TABLE IF NOT EXISTS project_task_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_checked BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklists_task ON project_task_checklists(task_id);
CREATE INDEX IF NOT EXISTS idx_checklists_company ON project_task_checklists(company_id);

ALTER TABLE project_task_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklists_company_isolation" ON project_task_checklists
  FOR ALL USING (company_id = current_company_id());

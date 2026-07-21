CREATE TABLE IF NOT EXISTS project_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, name)
);

CREATE TABLE IF NOT EXISTS project_task_tags (
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES project_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_project_tags_company ON project_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_task ON project_task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag ON project_task_tags(tag_id);

ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_company_isolation" ON project_tags
  USING (company_id = current_setting('app.current_company_id')::uuid);

ALTER TABLE project_task_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_tags_company_isolation" ON project_task_tags
  USING (company_id = current_setting('app.current_company_id')::uuid);

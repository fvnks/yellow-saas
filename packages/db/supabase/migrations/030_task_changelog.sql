-- Task change history
CREATE TABLE IF NOT EXISTS project_task_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_type TEXT NOT NULL DEFAULT 'update' CHECK (change_type IN ('create', 'update', 'delete', 'comment', 'status')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_changelog_task ON project_task_changelog(task_id);
CREATE INDEX IF NOT EXISTS idx_changelog_company ON project_task_changelog(company_id);
CREATE INDEX IF NOT EXISTS idx_changelog_created ON project_task_changelog(task_id, created_at DESC);

ALTER TABLE project_task_changelog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "changelog_company_isolation" ON project_task_changelog
  FOR ALL USING (company_id = current_company_id());

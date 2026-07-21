CREATE TABLE IF NOT EXISTS project_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'status_change', 'comment', 'assign', 'tag_add', 'tag_remove')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_company ON project_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_project ON project_audit_log(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_task ON project_audit_log(task_id);

ALTER TABLE project_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_company_isolation" ON project_audit_log
  USING (company_id = current_setting('app.current_company_id')::uuid);

-- 084_project_audit_log.sql
-- Activity log for tracking all project changes

CREATE TABLE IF NOT EXISTS project_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id),
  actor_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_activity_log_company ON project_activity_log(company_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_log_project ON project_activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_log_created ON project_activity_log(created_at DESC);

ALTER TABLE project_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_log_company_isolation" ON project_activity_log
  USING (company_id = current_setting('app.current_company_id')::uuid);

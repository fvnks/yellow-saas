CREATE TABLE IF NOT EXISTS project_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('status_change', 'task_completed', 'milestone_reached', 'due_date_passed')),
  trigger_value TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN ('create_task', 'assign_task', 'change_status', 'send_notification', 'update_field')),
  action_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_company ON project_automation_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_project ON project_automation_rules(project_id);

ALTER TABLE project_automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "automation_rules_company_isolation" ON project_automation_rules
  USING (company_id = current_setting('app.current_company_id')::uuid);

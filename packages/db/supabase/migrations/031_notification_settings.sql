-- Project notification settings
CREATE TABLE IF NOT EXISTS project_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  slack_webhook_url TEXT,
  slack_channel TEXT DEFAULT '#proyectos',
  email_recipients TEXT[] DEFAULT '{}',
  notify_task_created BOOLEAN DEFAULT TRUE,
  notify_task_completed BOOLEAN DEFAULT TRUE,
  notify_task_overdue BOOLEAN DEFAULT TRUE,
  notify_milestone_due BOOLEAN DEFAULT TRUE,
  notify_budget_alert BOOLEAN DEFAULT TRUE,
  notify_comment_added BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

CREATE INDEX IF NOT EXISTS idx_notif_settings_project ON project_notification_settings(project_id);

ALTER TABLE project_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_settings_company_isolation" ON project_notification_settings
  FOR ALL USING (company_id = current_company_id());

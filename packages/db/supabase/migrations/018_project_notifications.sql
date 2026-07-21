CREATE TABLE IF NOT EXISTS project_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_due_soon', 'task_overdue', 'milestone_due_soon', 'milestone_overdue', 'budget_warning', 'comment_added', 'status_change')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_notifications_company ON project_notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_project_notifications_user ON project_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_project_notifications_unread ON project_notifications(user_id, is_read) WHERE is_read = false;

ALTER TABLE project_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_company_isolation" ON project_notifications
  USING (company_id = current_setting('app.current_company_id')::uuid);

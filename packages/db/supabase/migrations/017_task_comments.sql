CREATE TABLE IF NOT EXISTS project_task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_company ON project_task_comments(company_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON project_task_comments(task_id);

ALTER TABLE project_task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_comments_company_isolation" ON project_task_comments
  USING (company_id = current_setting('app.current_company_id')::uuid);

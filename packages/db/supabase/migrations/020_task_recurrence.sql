ALTER TABLE project_tasks
  ADD COLUMN IF NOT EXISTS recurrence_type TEXT CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
  ADD COLUMN IF NOT EXISTS recurrence_parent_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_generated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_project_tasks_recurrence ON project_tasks(recurrence_type) WHERE recurrence_type != 'none';

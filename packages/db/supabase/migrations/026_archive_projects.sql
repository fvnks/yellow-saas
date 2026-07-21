-- Add archived column to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES users(id);

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(company_id, archived) WHERE archived = TRUE;

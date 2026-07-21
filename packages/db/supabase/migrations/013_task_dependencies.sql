CREATE TABLE IF NOT EXISTS project_task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  depends_on_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
  lag_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (task_id, depends_on_id)
);

CREATE INDEX IF NOT EXISTS idx_project_task_deps_company ON project_task_dependencies(company_id);
CREATE INDEX IF NOT EXISTS idx_project_task_deps_project ON project_task_dependencies(project_id);
CREATE INDEX IF NOT EXISTS idx_project_task_deps_task ON project_task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_project_task_deps_depends ON project_task_dependencies(depends_on_id);

ALTER TABLE project_task_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_deps_company_isolation" ON project_task_dependencies
  USING (company_id = current_setting('app.current_company_id')::uuid);

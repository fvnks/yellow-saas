CREATE TABLE IF NOT EXISTS project_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  description TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stopped_at TIMESTAMPTZ,
  elapsed_seconds INTEGER GENERATED ALWAYS AS (
    CASE WHEN stopped_at IS NOT NULL THEN EXTRACT(EPOCH FROM (stopped_at - started_at))::INTEGER ELSE NULL END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_timers_company ON project_timers(company_id);
CREATE INDEX IF NOT EXISTS idx_project_timers_employee ON project_timers(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_timers_active ON project_timers(stopped_at) WHERE stopped_at IS NULL;

ALTER TABLE project_timers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timers_company_isolation" ON project_timers
  USING (company_id = current_setting('app.current_company_id')::uuid);

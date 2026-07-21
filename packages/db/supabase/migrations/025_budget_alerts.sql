-- Project budget alerts table
CREATE TABLE IF NOT EXISTS project_budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  threshold_percent INTEGER NOT NULL CHECK (threshold_percent > 0 AND threshold_percent <= 100),
  alert_type TEXT NOT NULL DEFAULT 'warning' CHECK (alert_type IN ('warning', 'danger', 'critical')),
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_budget_alerts_project ON project_budget_alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_company ON project_budget_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_unread ON project_budget_alerts(project_id, is_read) WHERE is_read = FALSE;

-- RLS policies
ALTER TABLE project_budget_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_alerts_company_isolation" ON project_budget_alerts
  FOR ALL USING (company_id = current_company_id());

-- Auto-generate alerts function
CREATE OR REPLACE FUNCTION check_budget_alerts()
RETURNS TRIGGER AS $$
DECLARE
  v_budget NUMERIC;
  v_total_costs NUMERIC;
  v_total_expenses NUMERIC;
  v_budget_used_percent NUMERIC;
  v_threshold RECORD;
BEGIN
  -- Get project budget
  SELECT budget INTO v_budget FROM projects WHERE id = NEW.project_id;
  
  IF v_budget IS NULL OR v_budget <= 0 THEN
    RETURN NEW;
  END IF;

  -- Calculate total costs + expenses
  SELECT COALESCE(SUM(amount), 0) INTO v_total_costs
  FROM project_costs WHERE project_id = NEW.project_id;
  
  SELECT COALESCE(SUM(amount), 0) INTO v_total_expenses
  FROM project_expenses WHERE project_id = NEW.project_id;

  v_budget_used_percent := ((v_total_costs + v_total_expenses) / v_budget) * 100;

  -- Check thresholds
  FOR v_threshold IN 
    SELECT DISTINCT threshold_percent 
    FROM project_budget_alerts 
    WHERE project_id = NEW.project_id 
    AND is_read = FALSE
  LOOP
    IF v_budget_used_percent >= v_threshold.threshold_percent THEN
      UPDATE project_budget_alerts 
      SET triggered_at = NOW(), message = FORMAT('Presupuesto al %s%% ($%s de $%s)', 
        v_threshold.threshold_percent, 
        (v_total_costs + v_total_expenses)::TEXT, 
        v_budget::TEXT)
      WHERE project_id = NEW.project_id 
      AND threshold_percent = v_threshold.threshold_percent
      AND is_read = FALSE;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on costs
CREATE OR REPLACE FUNCTION trigger_check_budget_on_cost()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_budget_alerts() FROM project_costs WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on expenses  
CREATE OR REPLACE FUNCTION trigger_check_budget_on_expense()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_budget_alerts() FROM project_expenses WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

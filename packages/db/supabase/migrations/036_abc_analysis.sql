-- ABC classification rules
CREATE TABLE IF NOT EXISTS inventory_abc_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Regla ABC',
  a_threshold NUMERIC(5,2) NOT NULL DEFAULT 80,
  b_threshold NUMERIC(5,2) NOT NULL DEFAULT 95,
  period_months INTEGER NOT NULL DEFAULT 12,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ABC classification results
CREATE TABLE IF NOT EXISTS inventory_abc_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES inventory_abc_rules(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  total_movement_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  movement_count INTEGER NOT NULL DEFAULT 0,
  classification CHAR(1) NOT NULL CHECK (classification IN ('A', 'B', 'C')),
  cumulative_pct NUMERIC(5,2) NOT NULL,
  rank INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abc_rules_company ON inventory_abc_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_abc_results_company ON inventory_abc_results(company_id);
CREATE INDEX IF NOT EXISTS idx_abc_results_rule ON inventory_abc_results(rule_id);

ALTER TABLE inventory_abc_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_abc_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "abc_rules_company_isolation" ON inventory_abc_rules
  FOR ALL USING (company_id = current_company_id());
CREATE POLICY "abc_results_company_isolation" ON inventory_abc_results
  FOR ALL USING (company_id = current_company_id());

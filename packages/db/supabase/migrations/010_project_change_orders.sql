-- 010_project_change_orders.sql
-- Change orders for scope control

CREATE TABLE IF NOT EXISTS project_change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  order_number SERIAL,
  title TEXT NOT NULL,
  description TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
  type TEXT NOT NULL DEFAULT 'scope' CHECK (type IN ('scope', 'timeline', 'budget', 'resource', 'other')),
  budget_impact DECIMAL(14,2) DEFAULT 0,
  timeline_impact_days INTEGER DEFAULT 0,
  requested_by TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_change_orders_company ON project_change_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_project ON project_change_orders(project_id);

ALTER TABLE project_change_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "change_orders_company_isolation" ON project_change_orders
  USING (company_id = current_setting('app.current_company_id')::uuid);

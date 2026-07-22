-- Physical inventory counts
CREATE TABLE IF NOT EXISTS physical_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Physical count items (lines)
CREATE TABLE IF NOT EXISTS physical_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  count_id UUID NOT NULL REFERENCES physical_counts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  expected_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  counted_quantity NUMERIC(12,2),
  variance NUMERIC(12,2) GENERATED ALWAYS AS (COALESCE(counted_quantity, 0) - expected_quantity) STORED,
  notes TEXT,
  counted_at TIMESTAMPTZ,
  counted_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_physical_counts_company ON physical_counts(company_id);
CREATE INDEX IF NOT EXISTS idx_physical_count_items_company ON physical_count_items(company_id);
CREATE INDEX IF NOT EXISTS idx_physical_count_items_count ON physical_count_items(count_id);

ALTER TABLE physical_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_count_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "physical_counts_company_isolation" ON physical_counts
  FOR ALL USING (company_id = current_company_id());
CREATE POLICY "physical_count_items_company_isolation" ON physical_count_items
  FOR ALL USING (company_id = current_company_id());

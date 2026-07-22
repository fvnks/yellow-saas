-- Inventory snapshots
CREATE TABLE IF NOT EXISTS inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  quantity NUMERIC(14,4) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(14,4),
  total_value NUMERIC(14,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_company ON inventory_snapshots(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_date ON inventory_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_product ON inventory_snapshots(product_id);

ALTER TABLE inventory_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_snapshots_company_isolation" ON inventory_snapshots
  FOR ALL USING (company_id = current_company_id());

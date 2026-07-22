-- UOM conversions
CREATE TABLE IF NOT EXISTS uom_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  from_uom TEXT NOT NULL,
  to_uom TEXT NOT NULL,
  conversion_factor NUMERIC(12,6) NOT NULL CHECK (conversion_factor > 0),
  is_base BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, product_id, from_uom, to_uom)
);

CREATE INDEX IF NOT EXISTS idx_uom_conversions_company ON uom_conversions(company_id);
CREATE INDEX IF NOT EXISTS idx_uom_conversions_product ON uom_conversions(product_id);

ALTER TABLE uom_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uom_conversions_company_isolation" ON uom_conversions
  FOR ALL USING (company_id = current_company_id());

-- Product expiration tracking
CREATE TABLE IF NOT EXISTS product_expirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  batch_number TEXT,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  expiration_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disposed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_expirations_company ON product_expirations(company_id);
CREATE INDEX IF NOT EXISTS idx_product_expirations_product ON product_expirations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_expirations_expiration ON product_expirations(expiration_date);

ALTER TABLE product_expirations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_expirations_company_isolation" ON product_expirations
  FOR ALL USING (company_id = current_company_id());

-- Product serial numbers
CREATE TABLE IF NOT EXISTS product_serials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  serial_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold', 'returned', 'defective', 'reserved')),
  batch_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, serial_number)
);

CREATE INDEX IF NOT EXISTS idx_product_serials_company ON product_serials(company_id);
CREATE INDEX IF NOT EXISTS idx_product_serials_product ON product_serials(product_id);
CREATE INDEX IF NOT EXISTS idx_product_serials_serial ON product_serials(serial_number);

ALTER TABLE product_serials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_serials_company_isolation" ON product_serials
  FOR ALL USING (company_id = current_company_id());

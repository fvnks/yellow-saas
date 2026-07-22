-- Product kits table
CREATE TABLE IF NOT EXISTS product_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kit items (components)
CREATE TABLE IF NOT EXISTS kit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  kit_id UUID NOT NULL REFERENCES product_kits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_kits_company ON product_kits(company_id);
CREATE INDEX IF NOT EXISTS idx_product_kits_product ON product_kits(product_id);
CREATE INDEX IF NOT EXISTS idx_kit_items_company ON kit_items(company_id);
CREATE INDEX IF NOT EXISTS idx_kit_items_kit ON kit_items(kit_id);

ALTER TABLE product_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_kits_company_isolation" ON product_kits
  FOR ALL USING (company_id = current_company_id());
CREATE POLICY "kit_items_company_isolation" ON kit_items
  FOR ALL USING (company_id = current_company_id());

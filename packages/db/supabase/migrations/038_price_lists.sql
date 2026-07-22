-- Product price lists
CREATE TABLE IF NOT EXISTS price_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'CLP',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price list items
CREATE TABLE IF NOT EXISTS price_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  price_list_id UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  unit_price NUMERIC(14,2) NOT NULL,
  min_quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
  discount_pct NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(price_list_id, product_id, min_quantity)
);

CREATE INDEX IF NOT EXISTS idx_price_lists_company ON price_lists(company_id);
CREATE INDEX IF NOT EXISTS idx_price_list_items_company ON price_list_items(company_id);
CREATE INDEX IF NOT EXISTS idx_price_list_items_list ON price_list_items(price_list_id);

ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "price_lists_company_isolation" ON price_lists
  FOR ALL USING (company_id = current_company_id());
CREATE POLICY "price_list_items_company_isolation" ON price_list_items
  FOR ALL USING (company_id = current_company_id());

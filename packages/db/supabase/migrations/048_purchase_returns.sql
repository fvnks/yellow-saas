CREATE TABLE IF NOT EXISTS purchase_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT NOT NULL,
  return_number VARCHAR(50) NOT NULL,
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  total_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'shipped', 'received', 'cancelled')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  return_id UUID REFERENCES purchase_returns(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(12,2) DEFAULT 0,
  line_total DECIMAL(12,2) DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_purchase_returns_company ON purchase_returns(company_id);
CREATE INDEX idx_purchase_returns_supplier ON purchase_returns(supplier_id);
CREATE INDEX idx_purchase_return_items_company ON purchase_return_items(company_id);
CREATE INDEX idx_purchase_return_items_return ON purchase_return_items(return_id);

ALTER TABLE purchase_returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchase_returns_company_policy" ON purchase_returns
  USING (company_id = (SELECT id FROM companies WHERE slug = current_setting('app.current_company_slug', true)));

CREATE POLICY "purchase_return_items_company_policy" ON purchase_return_items
  USING (company_id = (SELECT id FROM companies WHERE slug = current_setting('app.current_company_slug', true)));

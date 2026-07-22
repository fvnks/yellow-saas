CREATE TABLE IF NOT EXISTS purchase_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT NOT NULL,
  invoice_number VARCHAR(50) NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled')),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  notes TEXT,
  payment_terms VARCHAR(100),
  currency VARCHAR(3) DEFAULT 'CLP',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES purchase_invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  description VARCHAR(255),
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(12,2) DEFAULT 0,
  discount_pct DECIMAL(5,2) DEFAULT 0,
  tax_pct DECIMAL(5,2) DEFAULT 19,
  line_total DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_purchase_invoices_company ON purchase_invoices(company_id);
CREATE INDEX idx_purchase_invoices_supplier ON purchase_invoices(supplier_id);
CREATE INDEX idx_purchase_invoices_status ON purchase_invoices(status);
CREATE INDEX idx_purchase_invoice_items_company ON purchase_invoice_items(company_id);
CREATE INDEX idx_purchase_invoice_items_invoice ON purchase_invoice_items(invoice_id);

ALTER TABLE purchase_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchase_invoices_company_policy" ON purchase_invoices
  USING (company_id = (SELECT id FROM companies WHERE slug = current_setting('app.current_company_slug', true)));

CREATE POLICY "purchase_invoice_items_company_policy" ON purchase_invoice_items
  USING (company_id = (SELECT id FROM companies WHERE slug = current_setting('app.current_company_slug', true)));

CREATE TABLE IF NOT EXISTS purchase_debit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT NOT NULL,
  note_number VARCHAR(50) NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'cancelled')),
  reason TEXT,
  purchase_invoice_id UUID REFERENCES purchase_invoices(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_debit_note_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  note_id UUID REFERENCES purchase_debit_notes(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  description VARCHAR(255),
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(12,2) DEFAULT 0,
  line_total DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_purchase_dn_company ON purchase_debit_notes(company_id);
CREATE INDEX idx_purchase_dn_supplier ON purchase_debit_notes(supplier_id);
CREATE INDEX idx_purchase_dn_items_company ON purchase_debit_note_items(company_id);
CREATE INDEX idx_purchase_dn_items_note ON purchase_debit_note_items(note_id);

ALTER TABLE purchase_debit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchase_dn_company_policy" ON purchase_debit_notes
  USING (company_id = (SELECT id FROM companies WHERE slug = current_setting('app.current_company_slug', true)));

CREATE POLICY "purchase_dn_items_company_policy" ON purchase_debit_note_items
  USING (company_id = (SELECT id FROM companies WHERE slug = current_setting('app.current_company_slug', true)));

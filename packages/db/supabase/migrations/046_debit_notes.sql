-- Debit notes
CREATE TABLE IF NOT EXISTS debit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'applied', 'cancelled')),
  debit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT NOT NULL,
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  applied_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, number)
);

CREATE TABLE IF NOT EXISTS debit_note_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  debit_note_id UUID NOT NULL REFERENCES debit_notes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  description TEXT,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 19,
  tax_amount NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent/100) * tax_rate/100) STORED,
  line_total NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent/100) * (1 + tax_rate/100)) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debit_notes_company ON debit_notes(company_id);
CREATE INDEX IF NOT EXISTS idx_debit_notes_customer ON debit_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_debit_notes_invoice ON debit_notes(invoice_id);

ALTER TABLE debit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE debit_note_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "debit_notes_company_isolation" ON debit_notes
  FOR ALL USING (company_id = current_company_id());
CREATE POLICY "debit_note_items_company_isolation" ON debit_note_items
  FOR ALL USING (company_id = current_company_id());

-- Customer documents (attachments)
CREATE TABLE IF NOT EXISTS customer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_data TEXT,
  mime_type TEXT,
  file_size INTEGER,
  category TEXT DEFAULT 'other' CHECK (category IN ('contract', 'agreement', 'tax_id', 'invoice', 'certificate', 'other')),
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_documents_company ON customer_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_documents_customer ON customer_documents(customer_id);

ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_documents_company" ON customer_documents
  FOR ALL USING (company_id = current_company_id());

-- Customer portal columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS portal_token UUID DEFAULT gen_random_uuid();
ALTER TABLE customers ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_portal_token ON customers(portal_token) WHERE portal_enabled = true;

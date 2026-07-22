-- Supplier catalogs
CREATE TABLE IF NOT EXISTS supplier_catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_rows INTEGER DEFAULT 0,
  imported_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_supplier_catalogs_company ON supplier_catalogs(company_id);

ALTER TABLE supplier_catalogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "supplier_catalogs_company_isolation" ON supplier_catalogs
  FOR ALL USING (company_id = current_company_id());

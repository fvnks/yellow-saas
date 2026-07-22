-- Customer categories (tipo de cliente)
CREATE TABLE IF NOT EXISTS customer_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer segments (segmentación comercial)
CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  min_orders INTEGER DEFAULT 0,
  min_revenue NUMERIC(14,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer contacts (múltiples contactos)
CREATE TABLE IF NOT EXISTS customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer addresses (múltiples direcciones)
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Principal',
  address_type TEXT NOT NULL DEFAULT 'billing' CHECK (address_type IN ('billing', 'shipping', 'other')),
  street TEXT NOT NULL,
  number TEXT,
  commune TEXT,
  city TEXT,
  region TEXT,
  country TEXT DEFAULT 'CL',
  postal_code TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add category_id and segment_id to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES customer_categories(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS segment_id UUID REFERENCES customer_segments(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customer_categories_company ON customer_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_company ON customer_segments(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_company ON customer_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_customer ON customer_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_company ON customer_addresses(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_category ON customers(category_id);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(segment_id);

-- RLS
ALTER TABLE customer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_categories_company" ON customer_categories
  FOR ALL USING (company_id = current_company_id());
CREATE POLICY "customer_segments_company" ON customer_segments
  FOR ALL USING (company_id = current_company_id());
CREATE POLICY "customer_contacts_company" ON customer_contacts
  FOR ALL USING (company_id = current_company_id());
CREATE POLICY "customer_addresses_company" ON customer_addresses
  FOR ALL USING (company_id = current_company_id());

-- Updated_at triggers
CREATE TRIGGER update_customer_categories_updated_at BEFORE UPDATE ON customer_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_segments_updated_at BEFORE UPDATE ON customer_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_contacts_updated_at BEFORE UPDATE ON customer_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

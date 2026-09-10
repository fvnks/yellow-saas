-- 093: Vet Portal Tokens + Pharmacy Stock table
-- Adds token-based public access for pet owners and proper pharmacy inventory tracking

-- Portal access tokens: pet owners get a unique token to view their pet's info
CREATE TABLE IF NOT EXISTS veterinary_portal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES veterinary_clients(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  access_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vet_portal_tokens_token ON veterinary_portal_tokens(token);
CREATE INDEX idx_vet_portal_tokens_company ON veterinary_portal_tokens(company_id);
CREATE INDEX idx_vet_portal_tokens_patient ON veterinary_portal_tokens(patient_id);

-- Pharmacy stock: proper inventory tracking for veterinary medications
CREATE TABLE IF NOT EXISTS veterinary_pharmacy_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  medication_name VARCHAR(300) NOT NULL,
  active_ingredient VARCHAR(200),
  concentration VARCHAR(100),
  pharmaceutical_form VARCHAR(100),
  laboratory VARCHAR(200),
  batch_number VARCHAR(100),
  expiry_date DATE,
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock INT DEFAULT 5,
  unit_price_clp NUMERIC(12,0) DEFAULT 0,
  sale_price_clp NUMERIC(12,0) DEFAULT 0,
  supplier VARCHAR(200),
  location VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'depleted', 'recalled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vet_pharmacy_stock_company ON veterinary_pharmacy_stock(company_id);
CREATE INDEX idx_vet_pharmacy_stock_status ON veterinary_pharmacy_stock(company_id, status);

-- Pharmacy dispensing log
CREATE TABLE IF NOT EXISTS veterinary_pharmacy_dispenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES veterinary_pharmacy_stock(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES veterinary_patients(id),
  prescription_id UUID REFERENCES veterinary_prescriptions(id),
  professional_id UUID REFERENCES veterinary_professionals(id),
  quantity_dispensed INT NOT NULL CHECK (quantity_dispensed > 0),
  unit_price_clp NUMERIC(12,0) DEFAULT 0,
  total_price_clp NUMERIC(12,0) DEFAULT 0,
  dispensed_by UUID REFERENCES auth.users(id),
  dispensed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vet_pharmacy_dispenses_company ON veterinary_pharmacy_dispenses(company_id);
CREATE INDEX idx_vet_pharmacy_dispenses_stock ON veterinary_pharmacy_dispenses(stock_id);
CREATE INDEX idx_vet_pharmacy_dispenses_patient ON veterinary_pharmacy_dispenses(patient_id);

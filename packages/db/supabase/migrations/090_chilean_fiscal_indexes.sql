-- UF/UTM values tracking for Chilean ERP
-- Banco Central de Chile provides UF daily, SII provides UTM monthly

CREATE TABLE IF NOT EXISTS uf_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    value NUMERIC(14,6) NOT NULL,
    date DATE NOT NULL,
    source TEXT DEFAULT 'banco_central',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, date)
);

CREATE TABLE IF NOT EXISTS utm_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    value NUMERIC(14,6) NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    source TEXT DEFAULT 'sii',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, month, year)
);

CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    rate NUMERIC(14,6) NOT NULL,
    date DATE NOT NULL,
    source TEXT DEFAULT 'bc_chile',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, currency, date)
);

CREATE INDEX IF NOT EXISTS idx_uf_values_company_date ON uf_values(company_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_utm_values_company_year_month ON utm_values(company_id, year, month DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_company_date ON exchange_rates(company_id, date DESC);

-- SII configuration for each company
ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS sii_username TEXT,
    ADD COLUMN IF NOT EXISTS sii_password TEXT,
    ADD COLUMN IF NOT EXISTS sii_cert_path TEXT,
    ADD COLUMN IF NOT EXISTS sii_cert_password TEXT,
    ADD COLUMN IF NOT EXISTS sii_test_mode BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS sii_document_type_default TEXT DEFAULT '33' CHECK (sii_document_type_default IN ('33', '46', '56', '55')),
    ADD COLUMN IF NOT EXISTS sii_quota_enabled BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS sii_quota_limit INTEGER,
    ADD COLUMN IF NOT EXISTS sii_last_submission_at TIMESTAMPTZ;

COMMENT ON TABLE uf_values IS 'Valores diarios de UF para indexación en UF';
COMMENT ON TABLE utm_values IS 'Valores mensuales de UTM para cálculos impositivos';
COMMENT ON TABLE exchange_rates IS 'Tasas de cambio USD/CLP y otras monedas';

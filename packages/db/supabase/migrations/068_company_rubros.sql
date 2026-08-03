-- 068_company_rubros.sql
-- Rubros de empresa para clasificación de clientes

CREATE TABLE IF NOT EXISTS company_rubros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_company_rubros_company ON company_rubros(company_id);

-- Add rubro_id to customers table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'rubro_id') THEN
        ALTER TABLE customers ADD COLUMN rubro_id UUID REFERENCES company_rubros(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_customers_rubro ON customers(rubro_id);

-- 005_cost_centers.sql
-- Centros de costo para asignación contable de productos

-- Cost Centers
CREATE TABLE cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, code)
);

-- Add cost_center_id to products
ALTER TABLE products ADD COLUMN cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL;

CREATE INDEX idx_cost_centers_company ON cost_centers(company_id);
CREATE INDEX idx_cost_centers_parent ON cost_centers(parent_id);
CREATE INDEX idx_products_cost_center ON products(cost_center_id);

-- Seed default cost centers for existing companies
-- (These will be created per-company via API when needed)

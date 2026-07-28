-- Migration 060: Formulas (Recetas) module
-- Stores recipes/formulas with ingredients and decimal quantities

CREATE TABLE IF NOT EXISTS formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  output_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  yield_quantity DECIMAL(12,4) DEFAULT 1,
  yield_unit VARCHAR(50) DEFAULT 'un',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS formula_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_id UUID NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity DECIMAL(12,4) NOT NULL,
  unit VARCHAR(50) DEFAULT 'un',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS formula_productions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  formula_id UUID NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  quantity DECIMAL(12,4) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  notes TEXT,
  produced_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_formulas_company_id ON formulas(company_id);
CREATE INDEX IF NOT EXISTS idx_formula_ingredients_formula_id ON formula_ingredients(formula_id);
CREATE INDEX IF NOT EXISTS idx_formula_ingredients_company_id ON formula_ingredients(company_id);
CREATE INDEX IF NOT EXISTS idx_formula_productions_company_id ON formula_productions(company_id);

COMMENT ON TABLE formulas IS 'Production formulas/recipes with ingredients and yield quantities';
COMMENT ON TABLE formula_ingredients IS 'Ingredients for each formula with decimal quantities';
COMMENT ON TABLE formula_productions IS 'Production run log - tracks when formulas are produced';

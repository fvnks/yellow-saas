-- Migration 067: Recipe expenses (gastos operacionales de recetas)
-- General operational expenses: luz, agua, gas, arriendo, etc.

CREATE TABLE IF NOT EXISTS recipe_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  formula_id UUID REFERENCES formulas(id) ON DELETE SET NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT false,
  recurring_period VARCHAR(50),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipe_expenses_company ON recipe_expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_recipe_expenses_formula ON recipe_expenses(formula_id);

COMMENT ON TABLE recipe_expenses IS 'General operational expenses for recipes (not ingredients)';

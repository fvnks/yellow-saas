-- Migration 065: Stock entry log for recipe products
-- Records every stock movement (add/remove) with reason and timestamp

CREATE TABLE IF NOT EXISTS recipe_stock_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES recipe_products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('add', 'remove')),
  quantity DECIMAL(12,4) NOT NULL,
  previous_stock DECIMAL(12,4) NOT NULL,
  new_stock DECIMAL(12,4) NOT NULL,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipe_stock_entries_company_id ON recipe_stock_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_recipe_stock_entries_product_id ON recipe_stock_entries(product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_stock_entries_created_at ON recipe_stock_entries(created_at DESC);

COMMENT ON TABLE recipe_stock_entries IS 'Stock movement log for recipe products';

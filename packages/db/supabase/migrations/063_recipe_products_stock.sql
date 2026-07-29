-- Migration 063: Add stock tracking to recipe_products
-- Adds stock and min_stock columns for inventory semaphore

ALTER TABLE recipe_products
  ADD COLUMN IF NOT EXISTS stock DECIMAL(12,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_stock DECIMAL(12,4) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_recipe_products_stock ON recipe_products(stock);

COMMENT ON COLUMN recipe_products.stock IS 'Current stock quantity for this recipe product';
COMMENT ON COLUMN recipe_products.min_stock IS 'Minimum stock threshold - triggers red semaphore when below';

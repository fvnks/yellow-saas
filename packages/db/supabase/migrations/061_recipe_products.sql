-- Migration 061: Recipe Products (Mini-inventario de recetas)
-- Aislados del inventario ERP principal

CREATE TABLE IF NOT EXISTS recipe_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  unit_of_measure VARCHAR(50) DEFAULT 'UN',
  cost_price DECIMAL(12,2) DEFAULT 0,
  sale_price DECIMAL(12,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_recipe_products_company_id ON recipe_products(company_id);

-- Migrate existing formula_ingredients product references to recipe_products
-- First: copy products used as ingredients into recipe_products
DO $$
DECLARE
  rec RECORD;
  new_id UUID;
BEGIN
  FOR rec IN
    SELECT DISTINCT fi.product_id, fi.company_id,
           p.name, p.sku, p.unit_of_measure, p.cost_price, p.sale_price, p.description
    FROM formula_ingredients fi
    JOIN products p ON p.id = fi.product_id
    WHERE NOT EXISTS (
      SELECT 1 FROM recipe_products rp
      WHERE rp.company_id = fi.company_id AND rp.sku = p.sku
    )
  LOOP
    INSERT INTO recipe_products (company_id, name, sku, unit_of_measure, cost_price, sale_price, description)
    VALUES (rec.company_id, rec.name, rec.sku, rec.unit_of_measure, rec.cost_price, rec.sale_price, rec.description)
    ON CONFLICT (company_id, sku) DO NOTHING
    RETURNING id INTO new_id;

    -- Update formula_ingredients to point to the new recipe_products
    IF new_id IS NOT NULL THEN
      UPDATE formula_ingredients
      SET product_id = new_id
      WHERE company_id = rec.company_id AND product_id = rec.product_id;
    END IF;
  END LOOP;
END $$;

-- Also migrate output_product_id references
DO $$
DECLARE
  rec RECORD;
  new_id UUID;
BEGIN
  FOR rec IN
    SELECT DISTINCT f.output_product_id, f.company_id,
           p.name, p.sku, p.unit_of_measure, p.cost_price, p.sale_price, p.description
    FROM formulas f
    JOIN products p ON p.id = f.output_product_id
    WHERE NOT EXISTS (
      SELECT 1 FROM recipe_products rp
      WHERE rp.company_id = f.company_id AND rp.sku = p.sku
    )
  LOOP
    INSERT INTO recipe_products (company_id, name, sku, unit_of_measure, cost_price, sale_price, description)
    VALUES (rec.company_id, rec.name, rec.sku, rec.unit_of_measure, rec.cost_price, rec.sale_price, rec.description)
    ON CONFLICT (company_id, sku) DO NOTHING
    RETURNING id INTO new_id;

    IF new_id IS NOT NULL THEN
      UPDATE formulas
      SET output_product_id = new_id
      WHERE company_id = rec.company_id AND output_product_id = rec.output_product_id;
    END IF;
  END LOOP;
END $$;

-- Drop old FK constraints and recreate pointing to recipe_products
ALTER TABLE formula_ingredients
  DROP CONSTRAINT IF EXISTS formula_ingredients_product_id_fkey;

ALTER TABLE formula_ingredients
  ADD CONSTRAINT formula_ingredients_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES recipe_products(id) ON DELETE CASCADE;

ALTER TABLE formulas
  DROP CONSTRAINT IF EXISTS formulas_output_product_id_fkey;

ALTER TABLE formulas
  ADD CONSTRAINT formulas_output_product_id_fkey
  FOREIGN KEY (output_product_id) REFERENCES recipe_products(id) ON DELETE SET NULL;

COMMENT ON TABLE recipe_products IS 'Ingredientes y productos aislados del modulo de Recetas - no visibles en inventario ERP';

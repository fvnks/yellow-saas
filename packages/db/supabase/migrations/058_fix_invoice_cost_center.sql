-- 058_fix_invoice_cost_center.sql
-- Factura lleva centro de costo, ítems llevan categoría de compra

-- ============================================================
-- 1. purchase_invoices — agregar cost_center_id
-- ============================================================
DO $$ BEGIN
  ALTER TABLE purchase_invoices ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_purchase_invoices_cost_center ON purchase_invoices(cost_center_id);

-- ============================================================
-- 2. purchase_invoice_items — quitar cost_center_id (ya no va aquí)
-- ============================================================
DO $$ BEGIN
  ALTER TABLE purchase_invoice_items DROP COLUMN IF EXISTS cost_center_id;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- =====================================================
-- YELLOW ERP: Link purchases, sales, inventory to projects
-- =====================================================

-- Add project_id to purchase_orders
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_purchase_orders_project ON purchase_orders(project_id);

-- Add project_id to purchase_order_items
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Add project_id to sales_orders
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_sales_orders_project ON sales_orders(project_id);

-- Add project_id to stock_movements
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movements_project ON stock_movements(project_id);

-- Add project_id to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);

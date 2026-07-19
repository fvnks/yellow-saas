-- 006_cost_center_links.sql
-- Link cost centers to projects and inventory movements

-- Add cost_center_id to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_projects_cost_center ON projects(cost_center_id);

-- Add cost_center_id to stock_movements
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_stock_movements_cost_center ON stock_movements(cost_center_id);

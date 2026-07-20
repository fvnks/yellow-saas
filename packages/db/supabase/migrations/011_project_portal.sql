-- 011_project_portal.sql
-- Portal tokens for client visibility

ALTER TABLE projects ADD COLUMN IF NOT EXISTS portal_token TEXT UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portal_show_budget BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portal_show_costs BOOLEAN DEFAULT false;

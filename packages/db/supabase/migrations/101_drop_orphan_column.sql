-- Migration 101: Drop orphan employee_id_ref column from payroll_items
-- This column was added in migration 100 but is never used in any query or code.

ALTER TABLE payroll_items DROP COLUMN IF EXISTS employee_id_ref;

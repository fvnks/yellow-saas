-- Migration 066: Add margin percentage fields to formulas
-- Min/max margin percentage for each recipe, fixed per formula

ALTER TABLE formulas
  ADD COLUMN IF NOT EXISTS min_margin_pct DECIMAL(5,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS max_margin_pct DECIMAL(5,2) DEFAULT NULL;

COMMENT ON COLUMN formulas.min_margin_pct IS 'Minimum acceptable margin percentage for this recipe (e.g. 10 = 10%)';
COMMENT ON COLUMN formulas.max_margin_pct IS 'Maximum target margin percentage for this recipe (e.g. 60 = 60%)';

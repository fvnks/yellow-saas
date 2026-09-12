-- Fix C5: condos_units.type CHECK constraint
-- Original 072 only allowed English values; frontend uses Spanish.
-- Add Spanish equivalents so both work.
ALTER TABLE condos_units
  DROP CONSTRAINT IF EXISTS condos_units_type_check;

ALTER TABLE condos_units
  ADD CONSTRAINT condos_units_type_check
  CHECK (type IN (
    'apartment', 'house', 'commercial', 'parking', 'storage',
    'departamento', 'casa', 'parcela', 'bodega', 'estacionamiento'
  ));

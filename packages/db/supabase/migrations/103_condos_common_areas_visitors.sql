-- C4: Add missing tables for Espacios page (common areas, reservations, visitors)
-- These were referenced by the UI but never persisted to DB.

-- Common areas (spaces available for reservation)
CREATE TABLE IF NOT EXISTS condos_common_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER DEFAULT 0,
  hourly_rate_clp INTEGER DEFAULT 0,
  deposit_clp INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_condos_common_areas_company ON condos_common_areas(company_id);
CREATE INDEX IF NOT EXISTS idx_condos_common_areas_property ON condos_common_areas(property_id);

ALTER TABLE condos_common_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "common_areas_company_isolation" ON condos_common_areas
  USING (company_id = current_setting('app.current_company_id')::uuid);

-- Reservations for common areas
CREATE TABLE IF NOT EXISTS condos_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
  common_area_id UUID NOT NULL REFERENCES condos_common_areas(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
  reserver_name TEXT NOT NULL,
  reservation_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  fee_clp INTEGER DEFAULT 0,
  deposit_clp INTEGER DEFAULT 0,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_condos_reservations_company ON condos_reservations(company_id);
CREATE INDEX IF NOT EXISTS idx_condos_reservations_property ON condos_reservations(property_id);
CREATE INDEX IF NOT EXISTS idx_condos_reservations_area ON condos_reservations(common_area_id);
CREATE INDEX IF NOT EXISTS idx_condos_reservations_date ON condos_reservations(reservation_date);

ALTER TABLE condos_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations_company_isolation" ON condos_reservations
  USING (company_id = current_setting('app.current_company_id')::uuid);

-- Visitor / parking log
CREATE TABLE IF NOT EXISTS condos_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  visitor_rut TEXT,
  vehicle_plate TEXT,
  destination_unit_id UUID REFERENCES condos_units(id) ON DELETE SET NULL,
  destination_unit_number TEXT,
  entry_time TIMESTAMPTZ DEFAULT now(),
  exit_time TIMESTAMPTZ,
  parking_spot TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'exited')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_condos_visitors_company ON condos_visitors(company_id);
CREATE INDEX IF NOT EXISTS idx_condos_visitors_property ON condos_visitors(property_id);
CREATE INDEX IF NOT EXISTS idx_condos_visitors_status ON condos_visitors(status);

ALTER TABLE condos_visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visitors_company_isolation" ON condos_visitors
  USING (company_id = current_setting('app.current_company_id')::uuid);

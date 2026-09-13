-- Migration 105: Full Condominiums Extra Tables Schema (Ley 21.442)
-- Versioned creation of assemblies, proxies, topics, votes, meters, meter readings, violations, and insurance policies

-- 1. Assemblies (Ley 21.442)
CREATE TABLE IF NOT EXISTS condos_assemblies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  assembly_date TIMESTAMPTZ NOT NULL,
  assembly_type TEXT DEFAULT 'ordinary',
  quorum_required_pct NUMERIC(5,2) DEFAULT 50.00,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  minutes_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS condos_assembly_proxies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  assembly_id UUID NOT NULL REFERENCES condos_assemblies(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
  proxy_name TEXT NOT NULL,
  proxy_rut TEXT NOT NULL,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS condos_assembly_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  assembly_id UUID NOT NULL REFERENCES condos_assemblies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_voting BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS condos_assembly_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES condos_assembly_topics(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
  vote_option TEXT NOT NULL,
  alicuota_pct NUMERIC(8,5) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(topic_id, unit_id)
);

-- 2. Utility Meters
CREATE TABLE IF NOT EXISTS condos_utility_meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
  meter_type TEXT NOT NULL,
  meter_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS condos_meter_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  meter_id UUID NOT NULL REFERENCES condos_utility_meters(id) ON DELETE CASCADE,
  period_id UUID REFERENCES condos_periods(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
  previous_reading NUMERIC(12,2) DEFAULT 0,
  current_reading NUMERIC(12,2) DEFAULT 0,
  consumption NUMERIC(12,2) DEFAULT 0,
  unit_rate_clp NUMERIC(12,2) DEFAULT 0,
  total_clp BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Violations & Fines
CREATE TABLE IF NOT EXISTS condos_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
  infraction_description TEXT NOT NULL,
  fine_amount_clp BIGINT DEFAULT 0,
  fine_amount_uf NUMERIC(12,4) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'paid', 'appealed', 'cancelled')),
  period_id UUID REFERENCES condos_periods(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Insurance Policies
CREATE TABLE IF NOT EXISTS condos_insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
  insurer_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  fire_coverage_clp BIGINT DEFAULT 0,
  premium_amount_clp BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_condos_assemblies_company ON condos_assemblies(company_id);
CREATE INDEX IF NOT EXISTS idx_condos_assemblies_property ON condos_assemblies(property_id);
CREATE INDEX IF NOT EXISTS idx_condos_assembly_topics_assembly ON condos_assembly_topics(assembly_id);
CREATE INDEX IF NOT EXISTS idx_condos_assembly_votes_topic ON condos_assembly_votes(topic_id);
CREATE INDEX IF NOT EXISTS idx_condos_utility_meters_property ON condos_utility_meters(property_id);
CREATE INDEX IF NOT EXISTS idx_condos_utility_meters_unit ON condos_utility_meters(unit_id);
CREATE INDEX IF NOT EXISTS idx_condos_meter_readings_meter ON condos_meter_readings(meter_id);
CREATE INDEX IF NOT EXISTS idx_condos_violations_property ON condos_violations(property_id);
CREATE INDEX IF NOT EXISTS idx_condos_violations_unit ON condos_violations(unit_id);
CREATE INDEX IF NOT EXISTS idx_condos_insurance_policies_property ON condos_insurance_policies(property_id);

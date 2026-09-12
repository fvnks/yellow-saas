-- A2: Add amount_uf column to condos_expense_items (exists in bootstrap, missing from migrations)
ALTER TABLE condos_expense_items
  ADD COLUMN IF NOT EXISTS amount_uf NUMERIC(14,6) DEFAULT 0;

-- A5: Enable RLS on all condominio tables that lack it (migration 072 didn't add RLS)
-- Tables from 072: condos_properties, condos_units, condos_coefficients, condos_periods,
-- condos_expense_items, condos_unit_statements, condos_payments

DO $$
BEGIN
  -- condos_properties
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_properties_company_isolation') THEN
    ALTER TABLE condos_properties ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_properties_company_isolation" ON condos_properties
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_units
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_units_company_isolation') THEN
    ALTER TABLE condos_units ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_units_company_isolation" ON condos_units
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_coefficients
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_coefficients_company_isolation') THEN
    ALTER TABLE condos_coefficients ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_coefficients_company_isolation" ON condos_coefficients
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_periods
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_periods_company_isolation') THEN
    ALTER TABLE condos_periods ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_periods_company_isolation" ON condos_periods
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_expense_items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_expense_items_company_isolation') THEN
    ALTER TABLE condos_expense_items ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_expense_items_company_isolation" ON condos_expense_items
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_unit_statements
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_unit_statements_company_isolation') THEN
    ALTER TABLE condos_unit_statements ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_unit_statements_company_isolation" ON condos_unit_statements
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_payments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_payments_company_isolation') THEN
    ALTER TABLE condos_payments ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_payments_company_isolation" ON condos_payments
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_assemblies (from 072)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_assemblies_company_isolation') THEN
    ALTER TABLE condos_assemblies ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_assemblies_company_isolation" ON condos_assemblies
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_assembly_topics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_assembly_topics_company_isolation') THEN
    ALTER TABLE condos_assembly_topics ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_assembly_topics_company_isolation" ON condos_assembly_topics
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_assembly_votes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_assembly_votes_company_isolation') THEN
    ALTER TABLE condos_assembly_votes ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_assembly_votes_company_isolation" ON condos_assembly_votes
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_assembly_proxies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_assembly_proxies_company_isolation') THEN
    ALTER TABLE condos_assembly_proxies ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_assembly_proxies_company_isolation" ON condos_assembly_proxies
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_utility_meters
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_utility_meters_company_isolation') THEN
    ALTER TABLE condos_utility_meters ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_utility_meters_company_isolation" ON condos_utility_meters
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_meter_readings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_meter_readings_company_isolation') THEN
    ALTER TABLE condos_meter_readings ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_meter_readings_company_isolation" ON condos_meter_readings
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_violations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_violations_company_isolation') THEN
    ALTER TABLE condos_violations ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_violations_company_isolation" ON condos_violations
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;

  -- condos_insurance_policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'condos_insurance_policies_company_isolation') THEN
    ALTER TABLE condos_insurance_policies ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "condos_insurance_policies_company_isolation" ON condos_insurance_policies
      USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

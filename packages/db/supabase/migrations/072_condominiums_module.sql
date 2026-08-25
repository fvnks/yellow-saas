-- 072_condominiums_module.sql
-- Módulo de Condominios y Gastos Comunes para Yellow ERP

-- 1. Propiedades / Condominios
CREATE TABLE IF NOT EXISTS condos_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rut TEXT,
  address TEXT,
  commune TEXT,
  city TEXT,
  total_units INTEGER DEFAULT 0,
  reserve_fund_pct NUMERIC(5,2) DEFAULT 5.00,
  late_interest_pct NUMERIC(5,2) DEFAULT 1.50,
  due_day INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_condos_properties_company ON condos_properties(company_id);

-- 2. Unidades del Condominio
CREATE TABLE IF NOT EXISTS condos_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  type TEXT DEFAULT 'apartment' CHECK (type IN ('apartment', 'house', 'commercial', 'parking', 'storage')),
  owner_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  resident_name TEXT,
  resident_email TEXT,
  resident_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_condos_units_company ON condos_units(company_id);
CREATE INDEX IF NOT EXISTS idx_condos_units_property ON condos_units(property_id);

-- 3. Coeficientes de Prorrateo por Unidad
CREATE TABLE IF NOT EXISTS condos_coefficients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
  category TEXT DEFAULT 'general',
  percentage NUMERIC(8,5) DEFAULT 0.00000,
  coefficient_pct NUMERIC(8,5) DEFAULT 0.00000,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(unit_id, category)
);

CREATE INDEX IF NOT EXISTS idx_condos_coefficients_company ON condos_coefficients(company_id);
CREATE INDEX IF NOT EXISTS idx_condos_coefficients_unit ON condos_coefficients(unit_id);

-- 4. Períodos de Liquidación de Gastos Comunes
CREATE TABLE IF NOT EXISTS condos_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
  period_code TEXT,
  period_date DATE DEFAULT CURRENT_DATE,
  year INTEGER,
  month INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'closed', 'issued', 'active')),
  due_date DATE,
  total_expenses_clp BIGINT DEFAULT 0,
  total_amount NUMERIC(12,2) DEFAULT 0,
  calculated_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_condos_periods_company ON condos_periods(company_id);
CREATE INDEX IF NOT EXISTS idx_condos_periods_property ON condos_periods(property_id);

-- 5. Partidas de Gasto por Período
CREATE TABLE IF NOT EXISTS condos_expense_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES condos_periods(id) ON DELETE CASCADE,
  name TEXT,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_clp BIGINT DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  purchase_invoice_id UUID REFERENCES purchase_invoices(id) ON DELETE SET NULL,
  coefficient_category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_condos_expense_items_company ON condos_expense_items(company_id);
CREATE INDEX IF NOT EXISTS idx_condos_expense_items_period ON condos_expense_items(period_id);

-- 6. Colillas de Cobro Individuales
CREATE TABLE IF NOT EXISTS condos_unit_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  property_id UUID REFERENCES condos_properties(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES condos_periods(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
  coefficient_pct NUMERIC(8,5) DEFAULT 0,
  common_expense NUMERIC(12,2) DEFAULT 0,
  reserve_fund NUMERIC(12,2) DEFAULT 0,
  previous_debt_clp BIGINT DEFAULT 0,
  late_interest_clp BIGINT DEFAULT 0,
  base_expense_clp BIGINT DEFAULT 0,
  variable_expense_clp BIGINT DEFAULT 0,
  reserve_fund_clp BIGINT DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_clp BIGINT DEFAULT 0,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  paid_clp BIGINT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(period_id, unit_id)
);

CREATE INDEX IF NOT EXISTS idx_condos_unit_statements_company ON condos_unit_statements(company_id);
CREATE INDEX IF NOT EXISTS idx_condos_unit_statements_period ON condos_unit_statements(period_id);
CREATE INDEX IF NOT EXISTS idx_condos_unit_statements_unit ON condos_unit_statements(unit_id);

-- 7. Histórico de Pagos y Abonos
CREATE TABLE IF NOT EXISTS condos_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  statement_id UUID NOT NULL REFERENCES condos_unit_statements(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES condos_units(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_clp BIGINT DEFAULT 0,
  payment_method TEXT DEFAULT 'transfer',
  reference TEXT,
  reference_number TEXT,
  payment_date TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_condos_payments_company ON condos_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_condos_payments_statement ON condos_payments(statement_id);

-- Migration safety for existing tables (adds missing columns if tables already existed)
ALTER TABLE condos_coefficients ADD COLUMN IF NOT EXISTS coefficient_pct NUMERIC(8,5) DEFAULT 0.00000;
ALTER TABLE condos_periods ADD COLUMN IF NOT EXISTS period_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE condos_periods ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE condos_periods ADD COLUMN IF NOT EXISTS calculated_at TIMESTAMPTZ;
ALTER TABLE condos_expense_items ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE condos_expense_items ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE condos_expense_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE condos_unit_statements ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES condos_properties(id) ON DELETE CASCADE;
ALTER TABLE condos_unit_statements ADD COLUMN IF NOT EXISTS coefficient_pct NUMERIC(8,5) DEFAULT 0;
ALTER TABLE condos_unit_statements ADD COLUMN IF NOT EXISTS common_expense NUMERIC(12,2) DEFAULT 0;
ALTER TABLE condos_unit_statements ADD COLUMN IF NOT EXISTS reserve_fund NUMERIC(12,2) DEFAULT 0;
ALTER TABLE condos_unit_statements ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE condos_unit_statements ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12,2) DEFAULT 0;
ALTER TABLE condos_payments ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE condos_payments ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE condos_payments ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES condos_units(id) ON DELETE CASCADE;

-- 8. Permisos de Módulo
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'permissions_action_check') THEN
    ALTER TABLE permissions DROP CONSTRAINT permissions_action_check;
  END IF;
END $$;
ALTER TABLE permissions ADD CONSTRAINT permissions_action_check CHECK (action IN ('create', 'read', 'update', 'delete', 'calculate', 'manage', 'view_portal', 'export'));

INSERT INTO permissions (module, action, label, description) VALUES
  ('condominiums', 'read', 'Ver Condominios', 'Ver panel y colillas de condominios'),
  ('condominiums', 'create', 'Crear Gastos/Unidades', 'Registrar unidades y partidas de gasto'),
  ('condominiums', 'update', 'Editar Condominio', 'Modificar coeficientes y parámetros'),
  ('condominiums', 'calculate', 'Calcular Gastos Comunes', 'Ejecutar liquidación mensual y emisión de colillas'),
  ('condominiums', 'delete', 'Eliminar Registros', 'Eliminar partidas o unidades')
ON CONFLICT (module, action) DO NOTHING;

-- Asignar permisos al rol Admin existente
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Admin' AND p.module = 'condominiums'
ON CONFLICT DO NOTHING;

-- 9. Registrar en catálogo de módulos
INSERT INTO module_catalog (name, label, description, price_monthly, price_yearly, features, category, sort_order) VALUES
  ('condominiums', 'Condominios & Gastos Comunes', 'Gestión integral de condominios, copropietarios, coeficientes de prorrateo y emisión de colillas de cobro', 14990, 149900, '["Prorrateo por coeficientes", "Colillas PDF", "Fondo de reserva y moras", "Portal de residentes"]', 'administracion', 9)
ON CONFLICT (name) DO NOTHING;

-- Migration 085: Expense Management Module (Gestión de Gastos)

-- 1. Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  tax_deductible BOOLEAN NOT NULL DEFAULT false,
  parent_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_expense_categories_company ON expense_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_parent ON expense_categories(parent_id);

-- 2. Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  expense_number TEXT NOT NULL DEFAULT '',
  expense_date DATE NOT NULL DEFAULT current_date,
  amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  supplier_name TEXT,
  supplier_rut TEXT,
  document_type TEXT DEFAULT 'ticket' CHECK (document_type IN ('boleta','factura','ticket','other')),
  document_number TEXT,
  description TEXT,
  notes TEXT,
  cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','rejected')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_company ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_supplier ON expenses(supplier_name);

-- 3. Permissions
INSERT INTO permissions (module, action, label, description) VALUES
  ('gastos', 'read', 'Ver gastos', 'Puede ver el listado de gastos'),
  ('gastos', 'create', 'Crear gastos', 'Puede crear nuevos gastos'),
  ('gastos', 'update', 'Editar gastos', 'Puede editar gastos existentes'),
  ('gastos', 'delete', 'Eliminar gastos', 'Puede eliminar gastos')
ON CONFLICT (module, action) DO NOTHING;

-- 4. Seed default categories
INSERT INTO expense_categories (company_id, name, slug, color, tax_deductible)
SELECT c.id, 'Transporte', 'transporte', '#3B82F6', true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM expense_categories ec WHERE ec.company_id = c.id AND ec.slug = 'transporte'
);

INSERT INTO expense_categories (company_id, name, slug, color, tax_deductible)
SELECT c.id, 'Alimentación', 'alimentacion', '#F59E0B', true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM expense_categories ec WHERE ec.company_id = c.id AND ec.slug = 'alimentacion'
);

INSERT INTO expense_categories (company_id, name, slug, color, tax_deductible)
SELECT c.id, 'Oficina', 'oficina', '#6B7280', true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM expense_categories ec WHERE ec.company_id = c.id AND ec.slug = 'oficina'
);

INSERT INTO expense_categories (company_id, name, slug, color, tax_deductible)
SELECT c.id, 'Servicios Básicos', 'servicios-basicos', '#8B5CF6', false
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM expense_categories ec WHERE ec.company_id = c.id AND ec.slug = 'servicios-basicos'
);

INSERT INTO expense_categories (company_id, name, slug, color, tax_deductible)
SELECT c.id, 'Tecnología', 'tecnologia', '#06B6D4', true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM expense_categories ec WHERE ec.company_id = c.id AND ec.slug = 'tecnologia'
);

-- 5. Seed module in catalog
INSERT INTO module_catalog (name, label, description, price_monthly, price_yearly, features, category, sort_order, is_active)
VALUES (
  'expense_management',
  'Gestión de Gastos',
  'Control de gastos operativos con categorías, comprobantes y reportes tributarios',
  7990,
  79900,
  '["Categorías de gasto", "Captura de comprobantes", "Reportes por período", "Exportación SII", "Control presupuestal"]',
  'finanzas',
  9,
  true
)
ON CONFLICT (name) DO NOTHING;

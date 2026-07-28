-- Migration 056: Billing, payments & module activations for Mi Cuenta module

-- 1. Billing accounts (datos de facturación por empresa)
CREATE TABLE IF NOT EXISTS billing_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  tax_id TEXT,                          -- RUT
  business_name TEXT,                   -- Razón social
  address TEXT,
  city TEXT,
  region TEXT,
  country TEXT DEFAULT 'CL',
  billing_email TEXT,
  phone TEXT,
  payment_provider TEXT DEFAULT 'stripe', -- stripe, mach, webpay, etc.
  payment_provider_customer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Subscription payments (historial de pagos de suscripción)
CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,              -- in CLP cents
  currency TEXT DEFAULT 'CLP',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_provider TEXT NOT NULL,       -- stripe, mach, webpay, etc.
  provider_payment_id TEXT,             -- ID del pago en el proveedor
  provider_session_id TEXT,
  plan_name TEXT,
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly')),
  description TEXT,
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_company ON subscription_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);

-- 3. Subscription invoices (facturas generadas)
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES subscription_payments(id),
  invoice_number TEXT NOT NULL,
  amount INTEGER NOT NULL,              -- in CLP cents
  tax_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'CLP',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  pdf_url TEXT,
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_invoices_company ON subscription_invoices(company_id);

-- 4. Module catalog (catálogo de módulos disponibles)
CREATE TABLE IF NOT EXISTS module_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,           -- 'advanced_crm', 'hr_premium', etc.
  label TEXT NOT NULL,                  -- 'CRM Avanzado'
  description TEXT,
  price_monthly INTEGER DEFAULT 0,     -- in CLP cents
  price_yearly INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Module activations (módulos activados por empresa)
CREATE TABLE IF NOT EXISTS module_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'cancelled')),
  activated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  payment_id UUID REFERENCES subscription_payments(id),
  activated_by UUID REFERENCES profiles(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, module_name)
);

CREATE INDEX IF NOT EXISTS idx_module_activations_company ON module_activations(company_id);

-- 6. Seed module catalog with initial modules
INSERT INTO module_catalog (name, label, description, price_monthly, price_yearly, features, category, sort_order) VALUES
  ('advanced_crm', 'CRM Avanzado', 'Gestión de clientes con pipeline, scoring y automatización', 9990, 99900, '["Pipeline visual", "Lead scoring", "Automatizaciones", "Reportes avanzados"]', 'ventas', 1),
  ('hr_premium', 'RRHH Premium', 'Módulo completo de recursos humanos con evaluaciones y capacitación', 14990, 149900, '["Contratos digitales", "Control de asistencia", "Evaluaciones 360", "Capacitaciones"]', 'rrhh', 2),
  ('pos_plus', 'POS Plus', 'Terminal de punto de venta avanzado con múltiples cajas', 7990, 79900, '["Multi-caja", "Reportes de cierre", "Devoluciones", "Mesas y comandas"]', 'ventas', 3),
  ('accounting_pro', 'Contabilidad Pro', 'Contabilidad completa con libros electrónicos SII', 12990, 129900, '["Libro de compras/ventas", "Balance general", "Conciliación", "Exports SII"]', 'finanzas', 4),
  ('inventory_plus', 'Inventario Plus', 'Inventario avanzado con serialización, lotes y pronóstico', 8990, 89900, '["Serialización", "Lotes", "Pronóstico", "Multi-bodega"]', 'inventario', 5),
  ('projects_pro', 'Proyectos Pro', 'Gestión de proyectos con Gantt, recursos y presupuestos', 11990, 119900, '["Diagrama Gantt", "Recursos", "Presupuestos", "Reportes"]', 'proyectos', 6),
  ('support_chat', 'Soporte en Vivo', 'Widget de chat en vivo para soporte a clientes', 5990, 59900, '["Chat en vivo", "Base de conocimiento", "Tickets", "Dashboard"]', 'soporte', 7),
  ('api_access', 'Acceso API', 'Acceso completo a la API REST para integraciones', 19990, 199900, '["API REST completa", "Webhooks", "Rate limiting alto", "Documentación"]', 'desarrollo', 8)
ON CONFLICT (name) DO NOTHING;

-- 7. Add plan_type column to platform_plans if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'platform_plans' AND column_name = 'plan_type') THEN
    ALTER TABLE platform_plans ADD COLUMN plan_type TEXT DEFAULT 'base' CHECK (plan_type IN ('base', 'addon'));
  END IF;
END $$;

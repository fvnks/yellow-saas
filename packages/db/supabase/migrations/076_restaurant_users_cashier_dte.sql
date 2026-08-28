-- ============================================================
-- Yellow ERP - Restaurante: Sistema de Usuarios, Roles,
-- Cierre de Caja y Boletas DTE
-- Patrón multi-tenant con RLS por company_id (Ley 21.020/Chile)
-- ============================================================

-- ------------------------------------------------------------
-- restaurant_staff: Personal del establecimiento con rol y PIN
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurant_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'waiter'
    CHECK (role IN ('owner', 'admin', 'cashier', 'waiter', 'kitchen', 'bar')),
  pin TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurant_staff_company_isolation"
  ON restaurant_staff
  USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ------------------------------------------------------------
-- restaurant_role_permissions: Matriz de permisos por rol
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurant_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL
    CHECK (role IN ('owner', 'admin', 'cashier', 'waiter', 'kitchen', 'bar')),
  can_dashboard BOOLEAN NOT NULL DEFAULT FALSE,
  can_pos BOOLEAN NOT NULL DEFAULT FALSE,
  can_kiosk BOOLEAN NOT NULL DEFAULT FALSE,
  can_kitchen BOOLEAN NOT NULL DEFAULT FALSE,
  can_bar BOOLEAN NOT NULL DEFAULT FALSE,
  can_sales BOOLEAN NOT NULL DEFAULT FALSE,
  can_reservations BOOLEAN NOT NULL DEFAULT FALSE,
  can_cashier BOOLEAN NOT NULL DEFAULT FALSE,
  can_reports BOOLEAN NOT NULL DEFAULT FALSE,
  can_users BOOLEAN NOT NULL DEFAULT FALSE,
  can_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, role)
);

ALTER TABLE restaurant_role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurant_role_permissions_company_isolation"
  ON restaurant_role_permissions
  USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ------------------------------------------------------------
-- restaurant_cash_closures: Cierre de caja / arqueo por turno
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurant_cash_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  turno TEXT NOT NULL CHECK (turno IN ('mañana', 'tarde', 'noche')),
  opened_by TEXT,
  closed_by TEXT,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  expected_total_clp BIGINT NOT NULL DEFAULT 0,
  declared_cash_clp BIGINT NOT NULL DEFAULT 0,
  discrepancy_clp BIGINT NOT NULL DEFAULT 0,
  total_sales_clp BIGINT NOT NULL DEFAULT 0,
  tips_clp BIGINT NOT NULL DEFAULT 0,
  dte_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'abierta' CHECK (status IN ('abierta', 'cerrada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE restaurant_cash_closures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurant_cash_closures_company_isolation"
  ON restaurant_cash_closures
  USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ------------------------------------------------------------
-- restaurant_cash_closure_payments: Desglose por método de pago
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurant_cash_closure_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  closure_id UUID NOT NULL REFERENCES restaurant_cash_closures(id) ON DELETE CASCADE,
  method TEXT NOT NULL
    CHECK (method IN ('Efectivo', 'Transbank DB', 'Transbank CR', 'MercadoPago QR')),
  amount_clp BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE restaurant_cash_closure_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurant_cash_closure_payments_company_isolation"
  ON restaurant_cash_closure_payments
  USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ------------------------------------------------------------
-- restaurant_dte_boletas: Boletas electrónicas SII emitidas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurant_dte_boletas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  folio INTEGER NOT NULL,
  order_id TEXT,
  table_name TEXT,
  waiter_name TEXT,
  date_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  neto_clp BIGINT NOT NULL DEFAULT 0,
  iva_clp BIGINT NOT NULL DEFAULT 0,
  tip_clp BIGINT NOT NULL DEFAULT 0,
  total_clp BIGINT NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL
    CHECK (payment_method IN ('Efectivo', 'Transbank DB', 'Transbank CR', 'MercadoPago QR')),
  tipo TEXT NOT NULL DEFAULT 'Afecta' CHECK (tipo IN ('Afecta', 'Exenta')),
  retencion TEXT NOT NULL DEFAULT 'no_retiro' CHECK (retencion IN ('retiro', 'no_retiro')),
  sii_status TEXT NOT NULL DEFAULT 'Pendiente'
    CHECK (sii_status IN ('Aceptado SII', 'Pendiente', 'Rechazado')),
  ted_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, folio)
);

ALTER TABLE restaurant_dte_boletas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurant_dte_boletas_company_isolation"
  ON restaurant_dte_boletas
  USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ------------------------------------------------------------
-- Índices de rendimiento por company_id
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_restaurant_staff_company ON restaurant_staff(company_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_cash_closures_company ON restaurant_cash_closures(company_id, closed_at);
CREATE INDEX IF NOT EXISTS idx_restaurant_dte_boletas_company ON restaurant_dte_boletas(company_id, date_time);

-- Migration 054: Fix missing tables and columns from production DB
-- This catches up migrations 033-044 that were never applied

-- ============================================
-- ADD MISSING COLUMNS TO COMPANIES
-- ============================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS razon_social TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS giro TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email TEXT;

-- ============================================
-- ADD MISSING COLUMNS TO PURCHASE_ORDERS
-- ============================================
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid'));

-- ============================================
-- ADD MISSING COLUMNS TO INVOICES
-- ============================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid'));

-- ============================================
-- MISSING TABLES FROM MIGRATIONS 033-044
-- ============================================

-- 033: Stock alerts
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('min_stock', 'max_stock', 'out_of_stock', 'expiring')),
  threshold NUMERIC(12,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 035: Product kits
CREATE TABLE IF NOT EXISTS product_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  kit_id UUID NOT NULL REFERENCES product_kits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 036: ABC analysis
CREATE TABLE IF NOT EXISTS inventory_abc_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Regla ABC',
  a_threshold NUMERIC(5,2) NOT NULL DEFAULT 80,
  b_threshold NUMERIC(5,2) NOT NULL DEFAULT 95,
  period_months INTEGER NOT NULL DEFAULT 12,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_abc_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES inventory_abc_rules(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  total_movement_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  movement_count INTEGER NOT NULL DEFAULT 0,
  classification CHAR(1) NOT NULL CHECK (classification IN ('A', 'B', 'C')),
  cumulative_pct NUMERIC(5,2) NOT NULL,
  rank INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 037: Physical counts
CREATE TABLE IF NOT EXISTS physical_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS physical_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  count_id UUID NOT NULL REFERENCES physical_counts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  expected_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  counted_quantity NUMERIC(12,2),
  variance NUMERIC(12,2) GENERATED ALWAYS AS (COALESCE(counted_quantity, 0) - expected_quantity) STORED,
  notes TEXT,
  counted_at TIMESTAMPTZ,
  counted_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 039: Product expirations
CREATE TABLE IF NOT EXISTS product_expirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  batch_number TEXT,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  expiration_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disposed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 040: UOM conversions
CREATE TABLE IF NOT EXISTS uom_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  from_uom TEXT NOT NULL,
  to_uom TEXT NOT NULL,
  conversion_factor NUMERIC(12,6) NOT NULL CHECK (conversion_factor > 0),
  is_base BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, product_id, from_uom, to_uom)
);

-- 041: Inventory snapshots
CREATE TABLE IF NOT EXISTS inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  quantity NUMERIC(14,4) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(14,4),
  total_value NUMERIC(14,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 043: Supplier catalogs
CREATE TABLE IF NOT EXISTS supplier_catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_rows INTEGER DEFAULT 0,
  imported_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 044: Inventory audit log
CREATE TABLE IF NOT EXISTS inventory_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  changes JSONB,
  performed_by UUID,
  performed_by_name TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- stock_transfers: add product_id if missing (from migration 034)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_transfers' AND column_name = 'product_id') THEN
    ALTER TABLE stock_transfers ADD COLUMN product_id UUID REFERENCES products(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_transfers' AND column_name = 'from_warehouse_id') THEN
    ALTER TABLE stock_transfers ADD COLUMN from_warehouse_id UUID REFERENCES warehouses(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_transfers' AND column_name = 'to_warehouse_id') THEN
    ALTER TABLE stock_transfers ADD COLUMN to_warehouse_id UUID REFERENCES warehouses(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_transfers' AND column_name = 'quantity') THEN
    ALTER TABLE stock_transfers ADD COLUMN quantity NUMERIC(12,2);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_transfers' AND column_name = 'completed_at') THEN
    ALTER TABLE stock_transfers ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
END $$;

-- product_serials: add missing column (batch_number)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_serials' AND column_name = 'batch_number') THEN
    ALTER TABLE product_serials ADD COLUMN batch_number TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_serials' AND column_name = 'updated_at') THEN
    ALTER TABLE product_serials ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_stock_alerts_company ON stock_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_warehouse ON stock_alerts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_product_kits_company ON product_kits(company_id);
CREATE INDEX IF NOT EXISTS idx_product_kits_product ON product_kits(product_id);
CREATE INDEX IF NOT EXISTS idx_kit_items_company ON kit_items(company_id);
CREATE INDEX IF NOT EXISTS idx_kit_items_kit ON kit_items(kit_id);
CREATE INDEX IF NOT EXISTS idx_abc_rules_company ON inventory_abc_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_abc_results_company ON inventory_abc_results(company_id);
CREATE INDEX IF NOT EXISTS idx_abc_results_rule ON inventory_abc_results(rule_id);
CREATE INDEX IF NOT EXISTS idx_physical_counts_company ON physical_counts(company_id);
CREATE INDEX IF NOT EXISTS idx_physical_count_items_company ON physical_count_items(company_id);
CREATE INDEX IF NOT EXISTS idx_physical_count_items_count ON physical_count_items(count_id);
CREATE INDEX IF NOT EXISTS idx_product_expirations_company ON product_expirations(company_id);
CREATE INDEX IF NOT EXISTS idx_product_expirations_product ON product_expirations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_expirations_expiration ON product_expirations(expiration_date);
CREATE INDEX IF NOT EXISTS idx_uom_conversions_company ON uom_conversions(company_id);
CREATE INDEX IF NOT EXISTS idx_uom_conversions_product ON uom_conversions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_company ON inventory_snapshots(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_date ON inventory_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_product ON inventory_snapshots(product_id);
CREATE INDEX IF NOT EXISTS idx_supplier_catalogs_company ON supplier_catalogs(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_log_company ON inventory_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_log_entity ON inventory_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_log_created ON inventory_audit_log(created_at);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_abc_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_abc_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_count_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_expirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE uom_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audit_log ENABLE ROW LEVEL SECURITY;

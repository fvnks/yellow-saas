-- Migration 107: Create missing ERP tables that existed only in /api/migrate runtime
-- Goods Receipts, Customer Returns, Internal Orders, Webhooks

-- ============================================================
-- GOODS RECEIPTS (Recepción de Artículos desde Proveedores)
-- ============================================================
CREATE TABLE IF NOT EXISTS goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL,
  purchase_order_id UUID REFERENCES purchase_orders(id),
  supplier_id UUID REFERENCES suppliers(id),
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'completed', 'cancelled')),
  received_date TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, receipt_number)
);

CREATE TABLE IF NOT EXISTS goods_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  receipt_id UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
  purchase_order_item_id UUID REFERENCES purchase_order_items(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity_ordered DECIMAL(14,4) DEFAULT 0,
  quantity_received DECIMAL(14,4) NOT NULL DEFAULT 0,
  batch_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CUSTOMER RETURNS (Devoluciones de Clientes)
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  return_number TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  original_invoice_id UUID REFERENCES invoices(id),
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  reason TEXT,
  refund_amount DECIMAL(14,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, return_number)
);

CREATE TABLE IF NOT EXISTS customer_return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  return_id UUID NOT NULL REFERENCES customer_returns(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
  unit_price DECIMAL(14,2) DEFAULT 0,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('good', 'damaged', 'defective')),
  restock BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INTERNAL ORDERS (Pedidos Internos)
-- ============================================================
CREATE TABLE IF NOT EXISTS internal_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id),
  requested_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'picking', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, order_number)
);

CREATE TABLE IF NOT EXISTS internal_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES internal_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
  fulfilled_quantity DECIMAL(14,4) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- WEBHOOKS
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  retry_policy JSONB,
  headers JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'retrying')),
  attempt INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_goods_receipts_company ON goods_receipts(company_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_receipt ON goods_receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_customer_returns_company ON customer_returns(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_return_items_return ON customer_return_items(return_id);
CREATE INDEX IF NOT EXISTS idx_internal_orders_company ON internal_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_internal_order_items_order ON internal_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_company ON webhook_endpoints(company_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint ON webhook_deliveries(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);

-- RLS
ALTER TABLE goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY goods_receipts_tenant ON goods_receipts USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY goods_receipt_items_tenant ON goods_receipt_items USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY customer_returns_tenant ON customer_returns USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY customer_return_items_tenant ON customer_return_items USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY internal_orders_tenant ON internal_orders USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY internal_order_items_tenant ON internal_order_items USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY webhook_endpoints_tenant ON webhook_endpoints USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY webhook_deliveries_tenant ON webhook_deliveries USING (company_id = current_setting('app.current_company_id')::uuid);

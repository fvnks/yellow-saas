-- 098: Missing tables audit补 — goods receipts, customer returns, internal orders, webhooks, sales quotations
-- All tables use CREATE TABLE IF NOT EXISTS for safety

-- ============================================================
-- 1. GOODS RECEIPTS (Recepción de Artículos)
-- ============================================================

CREATE TABLE IF NOT EXISTS goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL,
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'completed', 'cancelled')),
  received_date TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (company_id, receipt_number)
);

CREATE TABLE IF NOT EXISTS goods_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  receipt_id UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
  purchase_order_item_id UUID NOT NULL REFERENCES purchase_order_items(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity_ordered DECIMAL(14,4) NOT NULL,
  quantity_received DECIMAL(14,4) NOT NULL,
  batch_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goods_receipts_company ON goods_receipts(company_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_purchase_order ON goods_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_supplier ON goods_receipts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_warehouse ON goods_receipts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_status ON goods_receipts(status);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_company ON goods_receipt_items(company_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_receipt ON goods_receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_product ON goods_receipt_items(product_id);

ALTER TABLE goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipt_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'goods_receipts_company_isolation' AND tablename = 'goods_receipts') THEN
    CREATE POLICY goods_receipts_company_isolation ON goods_receipts
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'goods_receipt_items_company_isolation' AND tablename = 'goods_receipt_items') THEN
    CREATE POLICY goods_receipt_items_company_isolation ON goods_receipt_items
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

-- ============================================================
-- 2. CUSTOMER RETURNS (Devoluciones)
-- ============================================================

CREATE TABLE IF NOT EXISTS customer_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  return_number TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  original_invoice_id UUID REFERENCES invoices(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  return_id UUID NOT NULL REFERENCES customer_returns(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity DECIMAL(14,4) NOT NULL,
  unit_price DECIMAL(14,2) NOT NULL,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('good', 'damaged', 'defective')),
  restock BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_returns_company ON customer_returns(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_returns_customer ON customer_returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_returns_warehouse ON customer_returns(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_customer_returns_status ON customer_returns(status);
CREATE INDEX IF NOT EXISTS idx_customer_return_items_company ON customer_return_items(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_return_items_return ON customer_return_items(return_id);
CREATE INDEX IF NOT EXISTS idx_customer_return_items_product ON customer_return_items(product_id);

ALTER TABLE customer_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_return_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'customer_returns_company_isolation' AND tablename = 'customer_returns') THEN
    CREATE POLICY customer_returns_company_isolation ON customer_returns
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'customer_return_items_company_isolation' AND tablename = 'customer_return_items') THEN
    CREATE POLICY customer_return_items_company_isolation ON customer_return_items
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

-- ============================================================
-- 3. INTERNAL ORDERS (Órdenes Internas)
-- ============================================================

CREATE TABLE IF NOT EXISTS internal_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  requested_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'picking', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (company_id, order_number)
);

CREATE TABLE IF NOT EXISTS internal_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES internal_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity DECIMAL(14,4) NOT NULL,
  fulfilled_quantity DECIMAL(14,4) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_internal_orders_company ON internal_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_internal_orders_warehouse ON internal_orders(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_internal_orders_status ON internal_orders(status);
CREATE INDEX IF NOT EXISTS idx_internal_order_items_company ON internal_order_items(company_id);
CREATE INDEX IF NOT EXISTS idx_internal_order_items_order ON internal_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_internal_order_items_product ON internal_order_items(product_id);

ALTER TABLE internal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_order_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'internal_orders_company_isolation' AND tablename = 'internal_orders') THEN
    CREATE POLICY internal_orders_company_isolation ON internal_orders
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'internal_order_items_company_isolation' AND tablename = 'internal_order_items') THEN
    CREATE POLICY internal_order_items_company_isolation ON internal_order_items
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

-- ============================================================
-- 4. WEBHOOK SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 5,
  retry_base_delay_ms INTEGER DEFAULT 1000,
  last_triggered_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt INTEGER DEFAULT 1,
  next_retry_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'abandoned')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_company ON webhook_endpoints(company_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_active ON webhook_endpoints(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_company ON webhook_deliveries(company_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint ON webhook_deliveries(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event ON webhook_deliveries(event_type);

ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'webhook_endpoints_company_isolation' AND tablename = 'webhook_endpoints') THEN
    CREATE POLICY webhook_endpoints_company_isolation ON webhook_endpoints
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'webhook_deliveries_company_isolation' AND tablename = 'webhook_deliveries') THEN
    CREATE POLICY webhook_deliveries_company_isolation ON webhook_deliveries
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

-- ============================================================
-- 5. SALES QUOTATIONS (Cotizaciones de Venta)
-- ============================================================

CREATE TABLE IF NOT EXISTS sales_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  quotation_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales_quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES sales_quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 19,
  line_total NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent/100)) STORED
);

CREATE INDEX IF NOT EXISTS idx_sales_quotations_company ON sales_quotations(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_quotations_customer ON sales_quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_quotations_status ON sales_quotations(status);
CREATE INDEX IF NOT EXISTS idx_sales_quotation_items_company ON sales_quotation_items(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_quotation_items_quotation ON sales_quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_sales_quotation_items_product ON sales_quotation_items(product_id);

ALTER TABLE sales_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_quotation_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sales_quotations_company_isolation' AND tablename = 'sales_quotations') THEN
    CREATE POLICY sales_quotations_company_isolation ON sales_quotations
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sales_quotation_items_company_isolation' AND tablename = 'sales_quotation_items') THEN
    CREATE POLICY sales_quotation_items_company_isolation ON sales_quotation_items
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
  END IF;
END $$;

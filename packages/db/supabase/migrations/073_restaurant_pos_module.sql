-- 073_restaurant_pos_module.sql
-- Módulo de Restaurante & POS Gastronómico para Yellow ERP

-- 1. Mesas y Salones
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  pin_code VARCHAR(4) NOT NULL,
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved', 'bill_requested')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_tables_company ON restaurant_tables(company_id);

-- 2. Productos y Platos de la Carta
CREATE TABLE IF NOT EXISTS restaurant_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'drink', 'dessert')),
  price_clp NUMERIC(12, 0) NOT NULL DEFAULT 0,
  description TEXT,
  station TEXT NOT NULL CHECK (station IN ('kitchen', 'bar')),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  image_emoji TEXT DEFAULT '🍽️',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_menu_items_company ON restaurant_menu_items(company_id);

-- 3. Comandas / Pedidos
CREATE TABLE IF NOT EXISTS restaurant_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  pin_code VARCHAR(4) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  total_clp NUMERIC(12, 0) NOT NULL DEFAULT 0,
  tip_clp NUMERIC(12, 0) NOT NULL DEFAULT 0,
  dte_sii_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_orders_company ON restaurant_orders(company_id);

-- 4. Detalles de Comanda (KDS Kitchen / KDS Bar)
CREATE TABLE IF NOT EXISTS restaurant_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES restaurant_orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES restaurant_menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_clp NUMERIC(12, 0) NOT NULL DEFAULT 0,
  station TEXT NOT NULL CHECK (station IN ('kitchen', 'bar')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_order_items_order ON restaurant_order_items(order_id);

-- 5. Reservas de Mesas
CREATE TABLE IF NOT EXISTS restaurant_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reservation_code VARCHAR(10) NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 2,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_reservations_company ON restaurant_reservations(company_id);

-- Reglas RLS
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their company restaurant tables" ON restaurant_tables
  FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their company restaurant menu" ON restaurant_menu_items
  FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their company restaurant orders" ON restaurant_orders
  FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their company restaurant order items" ON restaurant_order_items
  FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their company restaurant reservations" ON restaurant_reservations
  FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

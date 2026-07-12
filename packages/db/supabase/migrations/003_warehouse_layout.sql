-- 003_warehouse_layout.sql
-- Yellow ERP - Warehouse Layout module

-- Warehouse zones (Recepción, Almacenamiento, Despacho, etc.)
CREATE TABLE warehouse_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    color TEXT DEFAULT '#6366f1',
    x DECIMAL(10,2) DEFAULT 0,
    y DECIMAL(10,2) DEFAULT 0,
    width DECIMAL(10,2) DEFAULT 200,
    height DECIMAL(10,2) DEFAULT 200,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(warehouse_id, code)
);

-- Warehouse shelves (Estantes within zones)
CREATE TABLE warehouse_shelves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES warehouse_zones(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    x DECIMAL(10,2) DEFAULT 0,
    y DECIMAL(10,2) DEFAULT 0,
    width DECIMAL(10,2) DEFAULT 100,
    height DECIMAL(10,2) DEFAULT 40,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(zone_id, code)
);

-- Warehouse positions (Specific positions within shelves)
CREATE TABLE warehouse_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES warehouse_zones(id) ON DELETE CASCADE,
    shelf_id UUID REFERENCES warehouse_shelves(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT,
    x DECIMAL(10,2) DEFAULT 0,
    y DECIMAL(10,2) DEFAULT 0,
    width DECIMAL(10,2) DEFAULT 60,
    height DECIMAL(10,2) DEFAULT 60,
    capacity DECIMAL(14,4) DEFAULT 0,
    current_stock DECIMAL(14,4) DEFAULT 0,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE warehouse_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "warehouse_zones_company" ON warehouse_zones
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "warehouse_shelves_company" ON warehouse_shelves
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "warehouse_positions_company" ON warehouse_positions
    FOR ALL USING (company_id = current_company_id());

-- Indexes for performance
CREATE INDEX idx_warehouse_zones_warehouse_id ON warehouse_zones(warehouse_id);
CREATE INDEX idx_warehouse_zones_company_id ON warehouse_zones(company_id);
CREATE INDEX idx_warehouse_shelves_zone_id ON warehouse_shelves(zone_id);
CREATE INDEX idx_warehouse_shelves_warehouse_id ON warehouse_shelves(warehouse_id);
CREATE INDEX idx_warehouse_shelves_company_id ON warehouse_shelves(company_id);
CREATE INDEX idx_warehouse_positions_shelf_id ON warehouse_positions(shelf_id);
CREATE INDEX idx_warehouse_positions_zone_id ON warehouse_positions(zone_id);
CREATE INDEX idx_warehouse_positions_warehouse_id ON warehouse_positions(warehouse_id);
CREATE INDEX idx_warehouse_positions_company_id ON warehouse_positions(company_id);
CREATE INDEX idx_warehouse_positions_product_id ON warehouse_positions(product_id);

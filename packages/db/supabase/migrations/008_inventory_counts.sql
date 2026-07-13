-- 008_inventory_counts.sql
-- Conteos de inventario fisico

CREATE TABLE inventory_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    count_number TEXT NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
    count_type TEXT DEFAULT 'full' CHECK (count_type IN ('full', 'partial', 'cycle')),
    notes TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, count_number)
);

CREATE TABLE inventory_count_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    count_id UUID NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    system_quantity DECIMAL(14,4) NOT NULL DEFAULT 0,
    counted_quantity DECIMAL(14,4),
    difference DECIMAL(14,4) GENERATED ALWAYS AS (COALESCE(counted_quantity, 0) - system_quantity) STORED,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'counted', 'adjusted')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (count_id, product_id)
);

CREATE INDEX idx_inventory_counts_company ON inventory_counts(company_id);
CREATE INDEX idx_inventory_counts_status ON inventory_counts(status);
CREATE INDEX idx_inventory_count_items_count ON inventory_count_items(count_id);

-- 083_inventory_transfers.sql
-- Transferencias entre bodegas

CREATE TABLE stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    transfer_number TEXT NOT NULL,
    source_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    destination_warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'in_transit', 'delivered', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, transfer_number)
);

CREATE TABLE stock_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    transfer_id UUID NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity DECIMAL(14,4) NOT NULL,
    unit_cost DECIMAL(14,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stock_transfers_company ON stock_transfers(company_id);
CREATE INDEX idx_stock_transfers_status ON stock_transfers(status);
CREATE INDEX idx_stock_transfer_items_transfer ON stock_transfer_items(transfer_id);

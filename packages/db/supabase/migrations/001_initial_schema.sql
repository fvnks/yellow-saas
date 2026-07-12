-- 001_initial_schema.sql
-- Yellow ERP - Multi-tenant SaaS Database Schema
-- All tables include company_id for multi-tenancy with RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE TABLES
-- ============================================

-- Companies (Tenants)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subdomain TEXT UNIQUE,
    custom_domain TEXT UNIQUE,
    logo_url TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    last_login_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- User invitations
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    invited_by UUID NOT NULL REFERENCES profiles(id),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log for all mutations
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INVENTORY MODULE
-- ============================================

-- Categories
CREATE TABLE inventory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'Package',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Warehouses/Locations
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    address TEXT,
    city TEXT,
    region TEXT,
    country TEXT DEFAULT 'CL',
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, code)
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    sku TEXT NOT NULL,
    barcode TEXT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'product' CHECK (type IN ('product', 'service', 'combo', 'raw_material')),
    unit_of_measure TEXT DEFAULT 'UN',
    cost_price DECIMAL(14,4) DEFAULT 0,
    sale_price DECIMAL(14,4) DEFAULT 0,
    min_stock DECIMAL(14,4) DEFAULT 0,
    max_stock DECIMAL(14,4) DEFAULT 0,
    track_stock BOOLEAN DEFAULT true,
    allow_negative_stock BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_saleable BOOLEAN DEFAULT true,
    is_purchasable BOOLEAN DEFAULT true,
    weight DECIMAL(10,4),
    dimensions JSONB DEFAULT '{}'::jsonb,
    tax_id UUID REFERENCES taxes(id) ON DELETE SET NULL,
    images JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, sku)
);

-- Product variants (for products with variants like size/color)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    barcode TEXT,
    name TEXT NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    cost_price DECIMAL(14,4) DEFAULT 0,
    sale_price DECIMAL(14,4) DEFAULT 0,
    min_stock DECIMAL(14,4) DEFAULT 0,
    max_stock DECIMAL(14,4) DEFAULT 0,
    weight DECIMAL(10,4),
    dimensions JSONB DEFAULT '{}'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(product_id, sku)
);

-- Stock levels per warehouse
CREATE TABLE stock_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity DECIMAL(14,4) DEFAULT 0,
    reserved_quantity DECIMAL(14,4) DEFAULT 0,
    available_quantity DECIMAL(14,4) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    last_movement_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(warehouse_id, product_id, variant_id)
);

-- Stock movements (kardex)
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('in', 'out', 'transfer_in', 'transfer_out', 'adjustment', 'initial')),
    reference_type TEXT,
    reference_id UUID,
    quantity DECIMAL(14,4) NOT NULL,
    unit_cost DECIMAL(14,4),
    total_cost DECIMAL(14,4),
    batch_number TEXT,
    expiry_date DATE,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SALES MODULE
-- ============================================

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT,
    name TEXT NOT NULL,
    trade_name TEXT,
    tax_id TEXT,
    tax_id_type TEXT DEFAULT 'RUT' CHECK (tax_id_type IN ('RUT', 'PASAPORTE', 'OTRO')),
    address TEXT,
    city TEXT,
    region TEXT,
    country TEXT DEFAULT 'CL',
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    payment_terms INTEGER DEFAULT 0,
    credit_limit DECIMAL(14,2) DEFAULT 0,
    current_balance DECIMAL(14,2) DEFAULT 0,
    price_list_id UUID,
    tax_exempt BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, tax_id)
);

-- Price lists
CREATE TABLE price_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    currency TEXT DEFAULT 'CLP',
    adjustment_type TEXT DEFAULT 'fixed' CHECK (adjustment_type IN ('fixed', 'percentage', 'formula')),
    adjustment_value DECIMAL(10,4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Price list items
CREATE TABLE price_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_list_id UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    price DECIMAL(14,4) NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(price_list_id, product_id, variant_id)
);

-- Sales orders
CREATE TABLE sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    number TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'invoiced', 'cancelled')),
    order_date TIMESTAMPTZ DEFAULT now(),
    delivery_date TIMESTAMPTZ,
    payment_terms INTEGER DEFAULT 0,
    subtotal DECIMAL(14,2) DEFAULT 0,
    discount_amount DECIMAL(14,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    total_amount DECIMAL(14,2) DEFAULT 0,
    currency TEXT DEFAULT 'CLP',
    exchange_rate DECIMAL(10,4) DEFAULT 1,
    notes TEXT,
    internal_notes TEXT,
    salesperson_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, number)
);

-- Sales order items
CREATE TABLE sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    quantity DECIMAL(14,4) NOT NULL,
    unit_price DECIMAL(14,4) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(14,2) DEFAULT 0,
    tax_id UUID REFERENCES taxes(id) ON DELETE SET NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    line_total DECIMAL(14,2) GENERATED ALWAYS AS ((quantity * unit_price) - discount_amount + tax_amount) STORED,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PURCHASES MODULE
-- ============================================

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT,
    name TEXT NOT NULL,
    trade_name TEXT,
    tax_id TEXT,
    tax_id_type TEXT DEFAULT 'RUT' CHECK (tax_id_type IN ('RUT', 'PASAPORTE', 'OTRO')),
    address TEXT,
    city TEXT,
    region TEXT,
    country TEXT DEFAULT 'CL',
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    payment_terms INTEGER DEFAULT 0,
    credit_limit DECIMAL(14,2) DEFAULT 0,
    current_balance DECIMAL(14,2) DEFAULT 0,
    currency TEXT DEFAULT 'CLP',
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, tax_id)
);

-- Purchase orders
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    number TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled')),
    order_date TIMESTAMPTZ DEFAULT now(),
    expected_date TIMESTAMPTZ,
    payment_terms INTEGER DEFAULT 0,
    subtotal DECIMAL(14,2) DEFAULT 0,
    discount_amount DECIMAL(14,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    total_amount DECIMAL(14,2) DEFAULT 0,
    currency TEXT DEFAULT 'CLP',
    exchange_rate DECIMAL(10,4) DEFAULT 1,
    notes TEXT,
    internal_notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, number)
);

-- Purchase order items
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity DECIMAL(14,4) NOT NULL,
    received_quantity DECIMAL(14,4) DEFAULT 0,
    unit_price DECIMAL(14,4) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(14,2) DEFAULT 0,
    tax_id UUID REFERENCES taxes(id) ON DELETE SET NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    line_total DECIMAL(14,2) GENERATED ALWAYS AS ((quantity * unit_price) - discount_amount + tax_amount) STORED,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ACCOUNTING / TAXES
-- ============================================

-- Taxes (Chilean tax system)
CREATE TABLE taxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'iva' CHECK (type IN ('iva', 'exento', 'otro')),
    rate DECIMAL(5,2) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sri_code TEXT, -- For Chilean SII
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, code)
);

-- Chart of accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense', 'cost_of_sales')),
    parent_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    level INTEGER DEFAULT 1,
    description TEXT,
    currency TEXT DEFAULT 'CLP',
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, code)
);

-- Journal entries
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    entry_number TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    total_debit DECIMAL(14,2) DEFAULT 0,
    total_credit DECIMAL(14,2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    posted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, entry_number)
);

-- Journal entry lines
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    description TEXT,
    debit DECIMAL(14,2) DEFAULT 0,
    credit DECIMAL(14,2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- POS MODULE
-- ============================================

-- POS terminals
CREATE TABLE pos_terminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    device_id TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, code)
);

-- POS sales (boletas/facturas electrónicas)
CREATE TABLE pos_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    terminal_id UUID NOT NULL REFERENCES pos_terminals(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    cashier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    number TEXT NOT NULL,
    document_type TEXT DEFAULT 'boleta' CHECK (document_type IN ('boleta', 'factura', 'nota_credito', 'nota_debito')),
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'void', 'refunded')),
    subtotal DECIMAL(14,2) DEFAULT 0,
    discount_amount DECIMAL(14,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    total_amount DECIMAL(14,2) DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'mixed', 'other')),
    payment_details JSONB DEFAULT '{}'::jsonb,
    change_amount DECIMAL(14,2) DEFAULT 0,
    sii_track_id TEXT,
    sii_status TEXT,
    sii_xml TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, terminal_id, number)
);

-- POS sale items
CREATE TABLE pos_sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES pos_sales(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity DECIMAL(14,4) NOT NULL,
    unit_price DECIMAL(14,4) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(14,2) DEFAULT 0,
    tax_id UUID REFERENCES taxes(id) ON DELETE SET NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    line_total DECIMAL(14,2) GENERATED ALWAYS AS ((quantity * unit_price) - discount_amount + tax_amount) STORED,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Company indexes (critical for multi-tenant performance)
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_invitations_company_id ON invitations(company_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Inventory indexes
CREATE INDEX idx_inventory_categories_company_id ON inventory_categories(company_id);
CREATE INDEX idx_warehouses_company_id ON warehouses(company_id);
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_products_sku ON products(company_id, sku);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_stock_levels_warehouse_product ON stock_levels(warehouse_id, product_id);
CREATE INDEX idx_stock_movements_company_id ON stock_movements(company_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);

-- Sales indexes
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_customers_tax_id ON customers(company_id, tax_id);
CREATE INDEX idx_sales_orders_company_id ON sales_orders(company_id);
CREATE INDEX idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
CREATE INDEX idx_sales_orders_order_date ON sales_orders(order_date);
CREATE INDEX idx_sales_order_items_order_id ON sales_order_items(order_id);

-- Purchases indexes
CREATE INDEX idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX idx_purchase_orders_company_id ON purchase_orders(company_id);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);

-- Accounting indexes
CREATE INDEX idx_taxes_company_id ON taxes(company_id);
CREATE INDEX idx_accounts_company_id ON accounts(company_id);
CREATE INDEX idx_journal_entries_company_id ON journal_entries(company_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(date);
CREATE INDEX idx_journal_entry_lines_entry_id ON journal_entry_lines(entry_id);
CREATE INDEX idx_journal_entry_lines_account_id ON journal_entry_lines(account_id);

-- POS indexes
CREATE INDEX idx_pos_terminals_company_id ON pos_terminals(company_id);
CREATE INDEX idx_pos_sales_company_id ON pos_sales(company_id);
CREATE INDEX idx_pos_sales_terminal_id ON pos_sales(terminal_id);
CREATE INDEX idx_pos_sales_created_at ON pos_sales(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tenant tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

ALTER TABLE pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sale_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Companies: only super_admin can manage, users see their own
CREATE POLICY "companies_select_own" ON companies
    FOR SELECT USING (id = current_company_id());

CREATE POLICY "companies_update_own" ON companies
    FOR UPDATE USING (id = current_company_id());

-- Profiles: users see profiles in their company
CREATE POLICY "profiles_select_company" ON profiles
    FOR SELECT USING (company_id = current_company_id());

CREATE POLICY "profiles_insert_company" ON profiles
    FOR INSERT WITH CHECK (company_id = current_company_id());

CREATE POLICY "profiles_update_own_or_admin" ON profiles
    FOR UPDATE USING (
        id = auth.uid() OR 
        company_id = current_company_id() AND EXISTS (
            SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner', 'admin')
        )
    );

-- Invitations
CREATE POLICY "invitations_company" ON invitations
    FOR ALL USING (company_id = current_company_id());

-- Audit logs
CREATE POLICY "audit_logs_company" ON audit_logs
    FOR SELECT USING (company_id = current_company_id());

-- Inventory
CREATE POLICY "inventory_categories_company" ON inventory_categories
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "warehouses_company" ON warehouses
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "products_company" ON products
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "product_variants_company" ON product_variants
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "stock_levels_company" ON stock_levels
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "stock_movements_company" ON stock_movements
    FOR ALL USING (company_id = current_company_id());

-- Sales
CREATE POLICY "customers_company" ON customers
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "price_lists_company" ON price_lists
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "price_list_items_company" ON price_list_items
    FOR ALL USING (price_list_id IN (SELECT id FROM price_lists WHERE company_id = current_company_id()));

CREATE POLICY "sales_orders_company" ON sales_orders
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "sales_order_items_company" ON sales_order_items
    FOR ALL USING (company_id = current_company_id());

-- Purchases
CREATE POLICY "suppliers_company" ON suppliers
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "purchase_orders_company" ON purchase_orders
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "purchase_order_items_company" ON purchase_order_items
    FOR ALL USING (company_id = current_company_id());

-- Accounting
CREATE POLICY "taxes_company" ON taxes
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "accounts_company" ON accounts
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "journal_entries_company" ON journal_entries
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "journal_entry_lines_company" ON journal_entry_lines
    FOR ALL USING (company_id = current_company_id());

-- POS
CREATE POLICY "pos_terminals_company" ON pos_terminals
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "pos_sales_company" ON pos_sales
    FOR ALL USING (company_id = current_company_id());

CREATE POLICY "pos_sale_items_company" ON pos_sale_items
    FOR ALL USING (company_id = current_company_id());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get current company_id from JWT claims
CREATE OR REPLACE FUNCTION current_company_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
    SELECT (auth.jwt() ->> 'company_id')::uuid
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT LANGUAGE sql STABLE AS $$
    SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_categories_updated_at BEFORE UPDATE ON inventory_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_levels_updated_at BEFORE UPDATE ON stock_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_lists_updated_at BEFORE UPDATE ON price_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_list_items_updated_at BEFORE UPDATE ON price_list_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON sales_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_order_items_updated_at BEFORE UPDATE ON sales_order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_order_items_updated_at BEFORE UPDATE ON purchase_order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_taxes_updated_at BEFORE UPDATE ON taxes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pos_terminals_updated_at BEFORE UPDATE ON pos_terminals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
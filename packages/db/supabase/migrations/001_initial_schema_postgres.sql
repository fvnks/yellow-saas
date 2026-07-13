-- 001_initial_schema.sql (PostgreSQL puro - sin Supabase auth)
-- Yellow ERP - Multi-tenant SaaS Database Schema
-- All tables include company_id for multi-tenancy

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

-- Users (standalone, no Supabase auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    password_hash TEXT, -- For local auth
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
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'Package',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'product' CHECK (type IN ('product', 'service', 'combo')),
    category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    unit_of_measure TEXT DEFAULT 'UN',
    cost_price DECIMAL(14,2) DEFAULT 0,
    sale_price DECIMAL(14,2) DEFAULT 0,
    min_stock DECIMAL(14,4) DEFAULT 0,
    max_stock DECIMAL(14,4) DEFAULT 0,
    track_stock BOOLEAN DEFAULT true,
    barcode TEXT,
    tax_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, sku)
);

-- Warehouses
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
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, code)
);

-- Stock levels
CREATE TABLE stock_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity DECIMAL(14,4) DEFAULT 0,
    reserved_quantity DECIMAL(14,4) DEFAULT 0,
    available_quantity DECIMAL(14,4) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    min_stock_alert BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, product_id, warehouse_id)
);

-- Stock movements
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'transfer_in', 'transfer_out', 'initial')),
    quantity DECIMAL(14,4) NOT NULL,
    unit_cost DECIMAL(14,2),
    reference_type TEXT,
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SALES MODULE
-- ============================================

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    trade_name TEXT,
    tax_id TEXT,
    tax_id_type TEXT DEFAULT 'RUT',
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
    price_list_id UUID,
    tax_exempt BOOLEAN DEFAULT false,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sales orders
CREATE TABLE sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    warehouse_id UUID REFERENCES warehouses(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    order_date TIMESTAMPTZ DEFAULT now(),
    delivery_date TIMESTAMPTZ,
    payment_terms INTEGER DEFAULT 0,
    subtotal DECIMAL(14,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    total DECIMAL(14,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, order_number)
);

-- Sales order items
CREATE TABLE sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity DECIMAL(14,4) NOT NULL,
    unit_price DECIMAL(14,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 19,
    line_total DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100) * (1 + tax_rate / 100)) STORED,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery guides
CREATE TABLE delivery_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    guide_number TEXT NOT NULL,
    order_id UUID REFERENCES sales_orders(id),
    warehouse_id UUID REFERENCES warehouses(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
    transport TEXT,
    driver_name TEXT,
    vehicle_plate TEXT,
    shipping_address TEXT,
    shipping_date TIMESTAMPTZ,
    delivered_date TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, guide_number)
);

-- Delivery guide items
CREATE TABLE delivery_guide_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    guide_id UUID NOT NULL REFERENCES delivery_guides(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity DECIMAL(14,4) NOT NULL,
    observation TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    order_id UUID REFERENCES sales_orders(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'sent', 'paid', 'partial', 'overdue', 'cancelled')),
    invoice_date TIMESTAMPTZ DEFAULT now(),
    due_date TIMESTAMPTZ,
    payment_terms INTEGER DEFAULT 30,
    subtotal DECIMAL(14,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    total_amount DECIMAL(14,2) DEFAULT 0,
    paid_amount DECIMAL(14,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, invoice_number)
);

-- Invoice items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity DECIMAL(14,4) NOT NULL,
    unit_price DECIMAL(14,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 19,
    tax_amount DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100) * tax_rate / 100) STORED,
    line_total DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100) * (1 + tax_rate / 100)) STORED,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PURCHASES MODULE
-- ============================================

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    trade_name TEXT,
    tax_id TEXT,
    tax_id_type TEXT DEFAULT 'RUT',
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
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Purchase orders
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    warehouse_id UUID REFERENCES warehouses(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'confirmed', 'partial', 'received', 'cancelled')),
    order_date TIMESTAMPTZ DEFAULT now(),
    expected_date TIMESTAMPTZ,
    payment_terms INTEGER DEFAULT 0,
    subtotal DECIMAL(14,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    total DECIMAL(14,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, order_number)
);

-- Purchase order items
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity DECIMAL(14,4) NOT NULL,
    unit_price DECIMAL(14,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 19,
    line_total DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100) * (1 + tax_rate / 100)) STORED,
    received_quantity DECIMAL(14,4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Quotations
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    quote_date TIMESTAMPTZ DEFAULT now(),
    expiry_date TIMESTAMPTZ,
    total_amount DECIMAL(14,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, number)
);

-- Quotation items
CREATE TABLE quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity DECIMAL(14,4) NOT NULL,
    unit_price DECIMAL(14,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 19,
    line_total DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100) * (1 + tax_rate / 100)) STORED,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CRM MODULE
-- ============================================

-- Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
    assigned_to UUID REFERENCES profiles(id),
    estimated_value DECIMAL(14,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'task', 'note')),
    subject TEXT NOT NULL,
    description TEXT,
    related_type TEXT CHECK (related_type IN ('lead', 'customer', 'supplier', 'order', 'quote')),
    related_id UUID,
    assigned_to UUID REFERENCES profiles(id),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PRICE LISTS MODULE
-- ============================================

-- Price lists
CREATE TABLE price_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    currency TEXT DEFAULT 'CLP',
    adjustment_type TEXT DEFAULT 'fixed' CHECK (adjustment_type IN ('fixed', 'percent')),
    adjustment_value DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Price list items
CREATE TABLE price_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    price_list_id UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    price DECIMAL(14,2) NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (price_list_id, product_id)
);

-- ============================================
-- PAYROLL MODULE
-- ============================================

-- Employees
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    employee_code TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    birth_date DATE,
    hire_date DATE NOT NULL,
    termination_date DATE,
    department TEXT,
    position TEXT,
    contract_type TEXT DEFAULT 'indefinite' CHECK (contract_type IN ('indefinite', 'fixed_term', 'seasonal', 'part_time')),
    base_salary DECIMAL(14,2) DEFAULT 0,
    salary_frequency TEXT DEFAULT 'monthly' CHECK (salary_frequency IN ('weekly', 'biweekly', 'monthly')),
    bank_account TEXT,
    bank_name TEXT,
    tax_id TEXT,
    afp_id TEXT,
    health_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, employee_code)
);

-- Payroll runs
CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'approved', 'paid')),
    total_amount DECIMAL(14,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, period_start, period_end)
);

-- Payroll items
CREATE TABLE payroll_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    type TEXT NOT NULL CHECK (type IN ('earning', 'deduction')),
    concept TEXT NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    is_taxable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ACCOUNTING MODULE
-- ============================================

-- Chart of accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    parent_id UUID REFERENCES accounts(id),
    is_active BOOLEAN DEFAULT true,
    is_control BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, code)
);

-- Journal entries
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    entry_number TEXT NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    total_debit DECIMAL(14,2) DEFAULT 0,
    total_credit DECIMAL(14,2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
    created_by UUID REFERENCES profiles(id),
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, entry_number)
);

-- Journal entry lines
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id),
    description TEXT,
    debit DECIMAL(14,2) DEFAULT 0,
    credit DECIMAL(14,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PROJECTS MODULE
-- ============================================

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES customers(id),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(14,2) DEFAULT 0,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    project_manager_id UUID REFERENCES profiles(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, code)
);

-- Project tasks
CREATE TABLE project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    start_date DATE,
    due_date DATE,
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2) DEFAULT 0,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- POS MODULE
-- ============================================

-- POS terminals
CREATE TABLE pos_terminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, code)
);

-- POS sessions
CREATE TABLE pos_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    terminal_id UUID NOT NULL REFERENCES pos_terminals(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cash_count')),
    opening_cash DECIMAL(14,2) DEFAULT 0,
    closing_cash DECIMAL(14,2),
    expected_cash DECIMAL(14,2),
    difference DECIMAL(14,2),
    opened_at TIMESTAMPTZ DEFAULT now(),
    closed_at TIMESTAMPTZ
);

-- POS sales
CREATE TABLE pos_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES pos_sessions(id),
    sale_number TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id),
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'voided', 'refunded')),
    subtotal DECIMAL(14,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    total DECIMAL(14,2) DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'mixed')),
    payment_amount DECIMAL(14,2) DEFAULT 0,
    change_amount DECIMAL(14,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- POS sale items
CREATE TABLE pos_sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES pos_sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity DECIMAL(14,4) NOT NULL,
    unit_price DECIMAL(14,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 19,
    line_total DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100) * (1 + tax_rate / 100)) STORED,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- BILLING MODULE
-- ============================================

-- Payment methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'digital_wallet', 'other')),
    account_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payment_number TEXT NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT now(),
    payment_method_id UUID REFERENCES payment_methods(id),
    amount DECIMAL(14,2) NOT NULL,
    reference_type TEXT CHECK (reference_type IN ('invoice', 'sale_order', 'pos_sale')),
    reference_id UUID,
    customer_id UUID REFERENCES customers(id),
    supplier_id UUID REFERENCES suppliers(id),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, payment_number)
);

-- ============================================
-- WAREHOUSE LAYOUT MODULE
-- ============================================

-- Warehouse zones
CREATE TABLE warehouse_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    x DECIMAL(10,2) DEFAULT 0,
    y DECIMAL(10,2) DEFAULT 0,
    width DECIMAL(10,2) DEFAULT 100,
    height DECIMAL(10,2) DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (warehouse_id, code)
);

-- Warehouse shelves
CREATE TABLE warehouse_shelves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES warehouse_zones(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    x DECIMAL(10,2) DEFAULT 0,
    y DECIMAL(10,2) DEFAULT 0,
    width DECIMAL(10,2) DEFAULT 50,
    height DECIMAL(10,2) DEFAULT 50,
    levels INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (warehouse_id, code)
);

-- Warehouse positions
CREATE TABLE warehouse_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES warehouse_zones(id) ON DELETE SET NULL,
    shelf_id UUID REFERENCES warehouse_shelves(id) ON DELETE SET NULL,
    code TEXT NOT NULL,
    x DECIMAL(10,2) DEFAULT 0,
    y DECIMAL(10,2) DEFAULT 0,
    width DECIMAL(10,2) DEFAULT 30,
    height DECIMAL(10,2) DEFAULT 30,
    capacity DECIMAL(10,2) DEFAULT 100,
    position_type TEXT DEFAULT 'floor' CHECK (position_type IN ('floor', 'shelf', 'rack', 'bin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (warehouse_id, code)
);

-- ============================================
-- ROLES & PERMISSIONS MODULE
-- ============================================

-- Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete')),
    label TEXT NOT NULL,
    description TEXT,
    UNIQUE (module, action)
);

-- Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (company_id, name)
);

-- Role permissions
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- User roles
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Core
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Inventory
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_stock_levels_product ON stock_levels(product_id);
CREATE INDEX idx_stock_levels_warehouse ON stock_levels(warehouse_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_warehouse ON stock_movements(warehouse_id);

-- Sales
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_customers_tax_id ON customers(tax_id);
CREATE INDEX idx_sales_orders_company_id ON sales_orders(company_id);
CREATE INDEX idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
CREATE INDEX idx_delivery_guides_company_id ON delivery_guides(company_id);
CREATE INDEX idx_delivery_guides_order ON delivery_guides(order_id);
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Purchases
CREATE INDEX idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX idx_purchase_orders_company_id ON purchase_orders(company_id);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_quotations_company_id ON quotations(company_id);

-- CRM
CREATE INDEX idx_leads_company_id ON leads(company_id);
CREATE INDEX idx_activities_company_id ON activities(company_id);
CREATE INDEX idx_activities_related ON activities(related_type, related_id);

-- Price lists
CREATE INDEX idx_price_lists_company_id ON price_lists(company_id);
CREATE INDEX idx_price_list_items_list ON price_list_items(price_list_id);

-- Payroll
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_payroll_runs_company_id ON payroll_runs(company_id);

-- Accounting
CREATE INDEX idx_accounts_company_id ON accounts(company_id);
CREATE INDEX idx_journal_entries_company_id ON journal_entries(company_id);
CREATE INDEX idx_journal_entry_lines_entry ON journal_entry_lines(entry_id);

-- Projects
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);

-- POS
CREATE INDEX idx_pos_terminals_company_id ON pos_terminals(company_id);
CREATE INDEX idx_pos_sessions_terminal ON pos_sessions(terminal_id);
CREATE INDEX idx_pos_sales_session ON pos_sales(session_id);

-- Billing
CREATE INDEX idx_payments_company_id ON payments(company_id);
CREATE INDEX idx_payments_reference ON payments(reference_type, reference_id);

-- Warehouse layout
CREATE INDEX idx_warehouse_zones_warehouse ON warehouse_zones(warehouse_id);
CREATE INDEX idx_warehouse_shelves_zone ON warehouse_shelves(zone_id);
CREATE INDEX idx_warehouse_positions_warehouse ON warehouse_positions(warehouse_id);
CREATE INDEX idx_warehouse_positions_zone ON warehouse_positions(zone_id);
CREATE INDEX idx_warehouse_positions_shelf ON warehouse_positions(shelf_id);

-- Roles & permissions
CREATE INDEX idx_roles_company_id ON roles(company_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_categories_updated_at BEFORE UPDATE ON inventory_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON sales_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_guides_updated_at BEFORE UPDATE ON delivery_guides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_lists_updated_at BEFORE UPDATE ON price_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouse_zones_updated_at BEFORE UPDATE ON warehouse_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouse_shelves_updated_at BEFORE UPDATE ON warehouse_shelves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouse_positions_updated_at BEFORE UPDATE ON warehouse_positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
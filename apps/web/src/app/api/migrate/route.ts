import { NextResponse } from 'next/server';
import { query } from '@/api/lib/db';
import bcrypt from 'bcryptjs';

const MIGRATION_SECRET = process.env.JWT_SECRET;
if (!MIGRATION_SECRET) {
  throw new Error('La variable de entorno JWT_SECRET es requerida. Configúrala antes de iniciar la aplicación.');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.secret !== MIGRATION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: string[] = [];

    const tables = [
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
      `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`,
      `CREATE TABLE IF NOT EXISTS companies (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, subdomain TEXT UNIQUE, custom_domain TEXT UNIQUE, logo_url TEXT, settings JSONB DEFAULT '{}'::jsonb, plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')), status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')), trial_ends_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS profiles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, email TEXT NOT NULL, password_hash TEXT, full_name TEXT, avatar_url TEXT, role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')), status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')), last_login_at TIMESTAMPTZ, preferences JSONB DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS audit_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id UUID, old_data JSONB, new_data JSONB, ip_address INET, user_agent TEXT, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS inventory_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, color TEXT DEFAULT '#6366f1', icon TEXT DEFAULT 'Package', sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS products (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, sku TEXT NOT NULL, name TEXT NOT NULL, description TEXT, type TEXT DEFAULT 'product' CHECK (type IN ('product', 'service', 'combo')), category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL, unit_of_measure TEXT DEFAULT 'UN', cost_price DECIMAL(14,2) DEFAULT 0, sale_price DECIMAL(14,2) DEFAULT 0, min_stock DECIMAL(14,4) DEFAULT 0, max_stock DECIMAL(14,4) DEFAULT 0, track_stock BOOLEAN DEFAULT true, barcode TEXT, tax_id TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, sku))`,
      `CREATE TABLE IF NOT EXISTS warehouses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, code TEXT NOT NULL, address TEXT, city TEXT, region TEXT, country TEXT DEFAULT 'CL', postal_code TEXT, phone TEXT, email TEXT, is_default BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, code))`,
      `CREATE TABLE IF NOT EXISTS stock_levels (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE, quantity DECIMAL(14,4) DEFAULT 0, reserved_quantity DECIMAL(14,4) DEFAULT 0, available_quantity DECIMAL(14,4) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED, min_stock_alert BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, product_id, warehouse_id))`,
      `CREATE TABLE IF NOT EXISTS stock_movements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE, type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'transfer_in', 'transfer_out', 'initial')), quantity DECIMAL(14,4) NOT NULL, unit_cost DECIMAL(14,2), reference_type TEXT, reference_id UUID, notes TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS customers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, code TEXT, trade_name TEXT, tax_id TEXT, tax_id_type TEXT DEFAULT 'RUT', address TEXT, city TEXT, region TEXT, country TEXT DEFAULT 'CL', postal_code TEXT, phone TEXT, email TEXT, website TEXT, contact_person TEXT, contact_phone TEXT, contact_email TEXT, payment_terms INTEGER DEFAULT 0, credit_limit DECIMAL(14,2) DEFAULT 0, price_list_id UUID, tax_exempt BOOLEAN DEFAULT false, notes TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS sales_orders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, order_number TEXT NOT NULL, customer_id UUID NOT NULL REFERENCES customers(id), warehouse_id UUID REFERENCES warehouses(id), status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')), order_date TIMESTAMPTZ DEFAULT now(), delivery_date TIMESTAMPTZ, payment_terms INTEGER DEFAULT 0, subtotal DECIMAL(14,2) DEFAULT 0, tax_amount DECIMAL(14,2) DEFAULT 0, total DECIMAL(14,2) DEFAULT 0, notes TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, order_number))`,
      `CREATE TABLE IF NOT EXISTS sales_order_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), quantity DECIMAL(14,4) NOT NULL, unit_price DECIMAL(14,2) NOT NULL, discount_percent DECIMAL(5,2) DEFAULT 0, tax_rate DECIMAL(5,2) DEFAULT 19, line_total DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100) * (1 + tax_rate / 100)) STORED, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS delivery_guides (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, guide_number TEXT NOT NULL, order_id UUID REFERENCES sales_orders(id), warehouse_id UUID REFERENCES warehouses(id), status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')), transport TEXT, driver_name TEXT, vehicle_plate TEXT, shipping_address TEXT, shipping_date TIMESTAMPTZ, delivered_date TIMESTAMPTZ, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, guide_number))`,
      `CREATE TABLE IF NOT EXISTS delivery_guide_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, guide_id UUID NOT NULL REFERENCES delivery_guides(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), quantity DECIMAL(14,4) NOT NULL, observation TEXT, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS invoices (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, invoice_number TEXT NOT NULL, order_id UUID REFERENCES sales_orders(id), customer_id UUID NOT NULL REFERENCES customers(id), status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'sent', 'paid', 'partial', 'overdue', 'cancelled')), invoice_date TIMESTAMPTZ DEFAULT now(), due_date TIMESTAMPTZ, payment_terms INTEGER DEFAULT 30, subtotal DECIMAL(14,2) DEFAULT 0, tax_amount DECIMAL(14,2) DEFAULT 0, total_amount DECIMAL(14,2) DEFAULT 0, paid_amount DECIMAL(14,2) DEFAULT 0, notes TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, invoice_number))`,
      `CREATE TABLE IF NOT EXISTS invoice_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE, product_id UUID REFERENCES products(id), description TEXT NOT NULL, quantity DECIMAL(14,4) NOT NULL, unit_price DECIMAL(14,2) NOT NULL, discount_percent DECIMAL(5,2) DEFAULT 0, tax_rate DECIMAL(5,2) DEFAULT 19, tax_amount DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100) * tax_rate / 100) STORED, line_total DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100) * (1 + tax_rate / 100)) STORED, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS suppliers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, code TEXT, trade_name TEXT, tax_id TEXT, tax_id_type TEXT DEFAULT 'RUT', address TEXT, city TEXT, region TEXT, country TEXT DEFAULT 'CL', postal_code TEXT, phone TEXT, email TEXT, website TEXT, contact_person TEXT, contact_phone TEXT, contact_email TEXT, payment_terms INTEGER DEFAULT 0, credit_limit DECIMAL(14,2) DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS purchase_orders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, order_number TEXT NOT NULL, supplier_id UUID NOT NULL REFERENCES suppliers(id), warehouse_id UUID REFERENCES warehouses(id), status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'confirmed', 'partial', 'received', 'cancelled')), order_date TIMESTAMPTZ DEFAULT now(), expected_date TIMESTAMPTZ, payment_terms INTEGER DEFAULT 0, subtotal DECIMAL(14,2) DEFAULT 0, tax_amount DECIMAL(14,2) DEFAULT 0, total DECIMAL(14,2) DEFAULT 0, notes TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, order_number))`,
      `CREATE TABLE IF NOT EXISTS purchase_order_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), quantity DECIMAL(14,4) NOT NULL, unit_price DECIMAL(14,2) NOT NULL, discount_percent DECIMAL(5,2) DEFAULT 0, tax_rate DECIMAL(5,2) DEFAULT 19, line_total DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100) * (1 + tax_rate / 100)) STORED, received_quantity DECIMAL(14,4) DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS quotations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, number TEXT NOT NULL, supplier_id UUID REFERENCES suppliers(id), status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')), quote_date TIMESTAMPTZ DEFAULT now(), expiry_date TIMESTAMPTZ, total_amount DECIMAL(14,2) DEFAULT 0, notes TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, number))`,
      `CREATE TABLE IF NOT EXISTS quotation_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), quantity DECIMAL(14,4) NOT NULL, unit_price DECIMAL(14,2) NOT NULL, discount_percent DECIMAL(5,2) DEFAULT 0, tax_rate DECIMAL(5,2) DEFAULT 19, line_total DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100) * (1 + tax_rate / 100)) STORED, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS leads (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, email TEXT, phone TEXT, source TEXT, status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')), assigned_to UUID REFERENCES profiles(id), estimated_value DECIMAL(14,2), notes TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS activities (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'task', 'note')), subject TEXT NOT NULL, description TEXT, related_type TEXT CHECK (related_type IN ('lead', 'customer', 'supplier', 'order', 'quote')), related_id UUID, assigned_to UUID REFERENCES profiles(id), due_date TIMESTAMPTZ, completed_at TIMESTAMPTZ, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS price_lists (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, is_default BOOLEAN DEFAULT false, currency TEXT DEFAULT 'CLP', adjustment_type TEXT DEFAULT 'fixed' CHECK (adjustment_type IN ('fixed', 'percent')), adjustment_value DECIMAL(10,2) DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS price_list_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, price_list_id UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), price DECIMAL(14,2) NOT NULL, min_quantity INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (price_list_id, product_id))`,
      `CREATE TABLE IF NOT EXISTS employees (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, user_id UUID REFERENCES profiles(id), employee_code TEXT NOT NULL, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT, phone TEXT, address TEXT, birth_date DATE, hire_date DATE NOT NULL, termination_date DATE, department TEXT, position TEXT, contract_type TEXT DEFAULT 'indefinite' CHECK (contract_type IN ('indefinite', 'fixed_term', 'seasonal', 'part_time')), base_salary DECIMAL(14,2) DEFAULT 0, salary_frequency TEXT DEFAULT 'monthly' CHECK (salary_frequency IN ('weekly', 'biweekly', 'monthly')), bank_account TEXT, bank_name TEXT, tax_id TEXT, afp_id TEXT, health_id TEXT, status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated')), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, employee_code))`,
      `CREATE TABLE IF NOT EXISTS payroll_runs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, period_start DATE NOT NULL, period_end DATE NOT NULL, status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'approved', 'paid')), total_amount DECIMAL(14,2) DEFAULT 0, notes TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, period_start, period_end))`,
      `CREATE TABLE IF NOT EXISTS payroll_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE, employee_id UUID NOT NULL REFERENCES employees(id), type TEXT NOT NULL CHECK (type IN ('earning', 'deduction')), concept TEXT NOT NULL, amount DECIMAL(14,2) NOT NULL, is_taxable BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS accounts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, code TEXT NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')), parent_id UUID REFERENCES accounts(id), is_active BOOLEAN DEFAULT true, is_control BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, code))`,
      `CREATE TABLE IF NOT EXISTS journal_entries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, entry_number TEXT NOT NULL, entry_date DATE NOT NULL, description TEXT NOT NULL, reference_type TEXT, reference_id UUID, total_debit DECIMAL(14,2) DEFAULT 0, total_credit DECIMAL(14,2) DEFAULT 0, status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')), created_by UUID REFERENCES profiles(id), posted_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, entry_number))`,
      `CREATE TABLE IF NOT EXISTS journal_entry_lines (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE, account_id UUID NOT NULL REFERENCES accounts(id), description TEXT, debit DECIMAL(14,2) DEFAULT 0, credit DECIMAL(14,2) DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS projects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, code TEXT NOT NULL, description TEXT, customer_id UUID REFERENCES customers(id), start_date DATE, end_date DATE, budget DECIMAL(14,2) DEFAULT 0, status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')), progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100), project_manager_id UUID REFERENCES profiles(id), created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, code))`,
      `CREATE TABLE IF NOT EXISTS project_tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE, parent_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, assignee_id UUID REFERENCES profiles(id), status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')), priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')), start_date DATE, due_date DATE, estimated_hours DECIMAL(6,2), actual_hours DECIMAL(6,2) DEFAULT 0, progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100), created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS pos_terminals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, warehouse_id UUID REFERENCES warehouses(id), name TEXT NOT NULL, code TEXT NOT NULL, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, code))`,
      `CREATE TABLE IF NOT EXISTS pos_sessions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, terminal_id UUID NOT NULL REFERENCES pos_terminals(id), user_id UUID NOT NULL REFERENCES profiles(id), status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cash_count')), opening_cash DECIMAL(14,2) DEFAULT 0, closing_cash DECIMAL(14,2), expected_cash DECIMAL(14,2), difference DECIMAL(14,2), opened_at TIMESTAMPTZ DEFAULT now(), closed_at TIMESTAMPTZ)`,
      `CREATE TABLE IF NOT EXISTS pos_sales (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, session_id UUID NOT NULL REFERENCES pos_sessions(id), sale_number TEXT NOT NULL, customer_id UUID REFERENCES customers(id), status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'voided', 'refunded')), subtotal DECIMAL(14,2) DEFAULT 0, tax_amount DECIMAL(14,2) DEFAULT 0, total DECIMAL(14,2) DEFAULT 0, payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'mixed')), payment_amount DECIMAL(14,2) DEFAULT 0, change_amount DECIMAL(14,2) DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS pos_sale_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, sale_id UUID NOT NULL REFERENCES pos_sales(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), quantity DECIMAL(14,4) NOT NULL, unit_price DECIMAL(14,2) NOT NULL, discount_percent DECIMAL(5,2) DEFAULT 0, tax_rate DECIMAL(5,2) DEFAULT 19, line_total DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent / 100) * (1 + tax_rate / 100)) STORED, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS payment_methods (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, type TEXT NOT NULL CHECK (type IN ('cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'digital_wallet', 'other')), account_number TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS payments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, payment_number TEXT NOT NULL, payment_date TIMESTAMPTZ DEFAULT now(), payment_method_id UUID REFERENCES payment_methods(id), amount DECIMAL(14,2) NOT NULL, reference_type TEXT CHECK (reference_type IN ('invoice', 'sale_order', 'pos_sale')), reference_id UUID, customer_id UUID REFERENCES customers(id), supplier_id UUID REFERENCES suppliers(id), status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')), notes TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, payment_number))`,
      `CREATE TABLE IF NOT EXISTS warehouse_zones (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE, code TEXT NOT NULL, name TEXT NOT NULL, description TEXT, color TEXT DEFAULT '#6366f1', x DECIMAL(10,2) DEFAULT 0, y DECIMAL(10,2) DEFAULT 0, width DECIMAL(10,2) DEFAULT 100, height DECIMAL(10,2) DEFAULT 100, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (warehouse_id, code))`,
      `CREATE TABLE IF NOT EXISTS warehouse_shelves (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE, zone_id UUID NOT NULL REFERENCES warehouse_zones(id) ON DELETE CASCADE, code TEXT NOT NULL, name TEXT NOT NULL, description TEXT, x DECIMAL(10,2) DEFAULT 0, y DECIMAL(10,2) DEFAULT 0, width DECIMAL(10,2) DEFAULT 50, height DECIMAL(10,2) DEFAULT 50, levels INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (warehouse_id, code))`,
      `CREATE TABLE IF NOT EXISTS warehouse_positions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE, zone_id UUID REFERENCES warehouse_zones(id) ON DELETE SET NULL, shelf_id UUID REFERENCES warehouse_shelves(id) ON DELETE SET NULL, code TEXT NOT NULL, x DECIMAL(10,2) DEFAULT 0, y DECIMAL(10,2) DEFAULT 0, width DECIMAL(10,2) DEFAULT 30, height DECIMAL(10,2) DEFAULT 30, capacity DECIMAL(10,2) DEFAULT 100, position_type TEXT DEFAULT 'floor' CHECK (position_type IN ('floor', 'shelf', 'rack', 'bin')), is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (warehouse_id, code))`,
      `CREATE TABLE IF NOT EXISTS permissions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), module TEXT NOT NULL, action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete')), label TEXT NOT NULL, description TEXT, UNIQUE (module, action))`,
      `CREATE TABLE IF NOT EXISTS roles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, is_system BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, name))`,
      `CREATE TABLE IF NOT EXISTS role_permissions (role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE, permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE, PRIMARY KEY (role_id, permission_id))`,
      `CREATE TABLE IF NOT EXISTS user_roles (user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE, PRIMARY KEY (user_id, role_id))`,
      `CREATE TABLE IF NOT EXISTS invitations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, email TEXT NOT NULL, role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member', 'viewer')), token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'), invited_by UUID NOT NULL REFERENCES profiles(id), expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'), accepted_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS cost_centers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, code TEXT NOT NULL, name TEXT NOT NULL, description TEXT, parent_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, code))`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL`,
      `CREATE TABLE IF NOT EXISTS stock_transfers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, transfer_number TEXT NOT NULL, source_warehouse_id UUID NOT NULL REFERENCES warehouses(id), destination_warehouse_id UUID NOT NULL REFERENCES warehouses(id), status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'in_transit', 'delivered', 'cancelled')), notes TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, transfer_number))`,
      `CREATE TABLE IF NOT EXISTS stock_transfer_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, transfer_id UUID NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), quantity DECIMAL(14,4) NOT NULL, unit_cost DECIMAL(14,2) DEFAULT 0, notes TEXT, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS notifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, type TEXT NOT NULL CHECK (type IN ('low_stock', 'out_of_stock', 'new_sale', 'overdue_invoice', 'payment_received', 'transfer', 'info')), title TEXT NOT NULL, message TEXT NOT NULL, severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger')), entity_type TEXT, entity_id UUID, is_read BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS inventory_counts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, count_number TEXT NOT NULL, warehouse_id UUID NOT NULL REFERENCES warehouses(id), status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')), count_type TEXT DEFAULT 'full' CHECK (count_type IN ('full', 'partial', 'cycle')), notes TEXT, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, count_number))`,
      `CREATE TABLE IF NOT EXISTS inventory_count_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, count_id UUID NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), system_quantity DECIMAL(14,4) NOT NULL DEFAULT 0, counted_quantity DECIMAL(14,4), difference DECIMAL(14,4) GENERATED ALWAYS AS (COALESCE(counted_quantity, 0) - system_quantity) STORED, status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'counted', 'adjusted')), notes TEXT, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (count_id, product_id))`,
      `CREATE TABLE IF NOT EXISTS taxes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, code TEXT NOT NULL, name TEXT NOT NULL, description TEXT, type TEXT DEFAULT 'iva' CHECK (type IN ('iva', 'exento', 'otro')), rate DECIMAL(5,2) NOT NULL, is_default BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true, sri_code TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, code))`,
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tax_id' AND data_type = 'text') THEN ALTER TABLE products DROP CONSTRAINT IF EXISTS products_tax_id_fkey; ALTER TABLE products ALTER COLUMN tax_id TYPE UUID USING tax_id::uuid; ALTER TABLE products ADD CONSTRAINT products_tax_id_fkey FOREIGN KEY (tax_id) REFERENCES taxes(id) ON DELETE SET NULL; END IF; END $$`,
      `CREATE TABLE IF NOT EXISTS product_batches (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, warehouse_id UUID NOT NULL REFERENCES warehouses(id), batch_number TEXT NOT NULL, quantity DECIMAL(14,4) NOT NULL DEFAULT 0, expiry_date DATE, manufacturing_date DATE, status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'consumed')), notes TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, product_id, warehouse_id, batch_number))`,
      `CREATE TABLE IF NOT EXISTS units_of_measure (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, code TEXT NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL CHECK (type IN ('weight', 'volume', 'length', 'area', 'piece', 'time')), base_unit TEXT, conversion_factor DECIMAL(14,6) DEFAULT 1, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, code))`,
      `CREATE TABLE IF NOT EXISTS product_variants (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, sku TEXT NOT NULL, name TEXT, attributes JSONB DEFAULT '{}'::jsonb, cost_price DECIMAL(14,2), sale_price DECIMAL(14,2), barcode TEXT, stock_quantity DECIMAL(14,4) DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, sku))`,
      `CREATE TABLE IF NOT EXISTS stock_reservations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), warehouse_id UUID NOT NULL REFERENCES warehouses(id), quantity DECIMAL(14,4) NOT NULL, reference_type TEXT CHECK (reference_type IN ('order', 'quotation', 'transfer', 'manual')), reference_id UUID, status TEXT DEFAULT 'active' CHECK (status IN ('active', 'released', 'fulfilled')), expires_at TIMESTAMPTZ, notes TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS stock_alerts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE, alert_type TEXT NOT NULL CHECK (alert_type IN ('min_stock', 'max_stock', 'out_of_stock', 'expiring')), threshold NUMERIC(12,2), is_active BOOLEAN NOT NULL DEFAULT TRUE, last_notified_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS product_kits (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS kit_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, kit_id UUID NOT NULL REFERENCES product_kits(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), quantity NUMERIC(12,2) NOT NULL DEFAULT 1 CHECK (quantity > 0), sort_order INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS inventory_abc_rules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL DEFAULT 'Regla ABC', a_threshold NUMERIC(5,2) NOT NULL DEFAULT 80, b_threshold NUMERIC(5,2) NOT NULL DEFAULT 95, period_months INTEGER NOT NULL DEFAULT 12, is_active BOOLEAN NOT NULL DEFAULT TRUE, last_run_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS inventory_abc_results (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, rule_id UUID NOT NULL REFERENCES inventory_abc_rules(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), total_movement_value NUMERIC(14,2) NOT NULL DEFAULT 0, movement_count INTEGER NOT NULL DEFAULT 0, classification CHAR(1) NOT NULL CHECK (classification IN ('A', 'B', 'C')), cumulative_pct NUMERIC(5,2) NOT NULL, rank INTEGER NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS physical_counts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, warehouse_id UUID NOT NULL REFERENCES warehouses(id), name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')), notes TEXT, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, created_by UUID, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS physical_count_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, count_id UUID NOT NULL REFERENCES physical_counts(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), expected_quantity NUMERIC(12,2) NOT NULL DEFAULT 0, counted_quantity NUMERIC(12,2), notes TEXT, counted_at TIMESTAMPTZ, counted_by UUID, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS product_expirations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), warehouse_id UUID NOT NULL REFERENCES warehouses(id), batch_number TEXT, quantity NUMERIC(12,2) NOT NULL DEFAULT 0, expiration_date DATE NOT NULL, status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disposed')), notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS uom_conversions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, from_uom TEXT NOT NULL, to_uom TEXT NOT NULL, conversion_factor NUMERIC(12,6) NOT NULL CHECK (conversion_factor > 0), is_base BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(company_id, product_id, from_uom, to_uom))`,
      `CREATE TABLE IF NOT EXISTS inventory_snapshots (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, snapshot_date DATE NOT NULL, product_id UUID NOT NULL REFERENCES products(id), warehouse_id UUID NOT NULL REFERENCES warehouses(id), quantity NUMERIC(14,4) NOT NULL DEFAULT 0, unit_cost NUMERIC(14,4), total_value NUMERIC(14,2), created_at TIMESTAMPTZ DEFAULT NOW())`,
      `CREATE TABLE IF NOT EXISTS supplier_catalogs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL, name TEXT NOT NULL, file_name TEXT, status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')), total_rows INTEGER DEFAULT 0, imported_rows INTEGER DEFAULT 0, error_rows INTEGER DEFAULT 0, errors JSONB DEFAULT '[]', created_at TIMESTAMPTZ DEFAULT NOW(), completed_at TIMESTAMPTZ)`,
      `CREATE TABLE IF NOT EXISTS inventory_audit_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, entity_type TEXT NOT NULL, entity_id UUID NOT NULL, entity_name TEXT, action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')), changes JSONB, performed_by UUID, performed_by_name TEXT, ip_address TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_transfers' AND column_name = 'product_id') THEN ALTER TABLE stock_transfers ADD COLUMN product_id UUID REFERENCES products(id); END IF; END $$`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_transfers' AND column_name = 'from_warehouse_id') THEN ALTER TABLE stock_transfers ADD COLUMN from_warehouse_id UUID REFERENCES warehouses(id); END IF; END $$`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_transfers' AND column_name = 'to_warehouse_id') THEN ALTER TABLE stock_transfers ADD COLUMN to_warehouse_id UUID REFERENCES warehouses(id); END IF; END $$`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_transfers' AND column_name = 'quantity') THEN ALTER TABLE stock_transfers ADD COLUMN quantity NUMERIC(12,2); END IF; END $$`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_serials' AND column_name = 'batch_number') THEN ALTER TABLE product_serials ADD COLUMN batch_number TEXT; END IF; END $$`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_serials' AND column_name = 'updated_at') THEN ALTER TABLE product_serials ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now(); END IF; END $$`,
    ];

    for (const sql of tables) {
      try { await query(sql); } catch (e: any) { results.push(`WARN: ${e.message?.substring(0, 80)}`); }
    }
    results.push(`Created ${tables.length} tables`);

    const alters = [
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL`,
      `ALTER TABLE stock_levels ADD COLUMN IF NOT EXISTS min_stock DECIMAL(14,4) DEFAULT 0`,
      `ALTER TABLE stock_levels ADD COLUMN IF NOT EXISTS max_stock DECIMAL(14,4) DEFAULT 0`,
      `ALTER TABLE stock_levels ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL`,
      `ALTER TABLE stock_levels ADD COLUMN IF NOT EXISTS reorder_point DECIMAL(14,4) DEFAULT 0`,
      `ALTER TABLE stock_levels ADD COLUMN IF NOT EXISTS reorder_qty DECIMAL(14,4) DEFAULT 0`,
      `ALTER TABLE stock_levels ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 0`,
      `ALTER TABLE stock_levels ADD COLUMN IF NOT EXISTS qc_status TEXT DEFAULT 'approved' CHECK (qc_status IN ('pending', 'approved', 'rejected', 'quarantine'))`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS tax_id TEXT`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS razon_social TEXT`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS giro TEXT`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS city TEXT`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS region TEXT`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS email TEXT`,
    ];
    for (const sql of alters) {
      await query(sql);
    }
    results.push(`Applied ${alters.length} ALTER TABLE migrations`);

    const newTables = [
      `CREATE TABLE IF NOT EXISTS product_tags (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, color TEXT DEFAULT '#6366f1', created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, name))`,
      `CREATE TABLE IF NOT EXISTS product_tag_links (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, tag_id UUID NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE, UNIQUE (product_id, tag_id))`,
      `CREATE TABLE IF NOT EXISTS product_price_history (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, price_type TEXT NOT NULL CHECK (price_type IN ('cost', 'sale')), old_price DECIMAL(14,2), new_price DECIMAL(14,2) NOT NULL, changed_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS adjustment_reasons (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, name))`,
      `CREATE TABLE IF NOT EXISTS product_serials (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, warehouse_id UUID NOT NULL REFERENCES warehouses(id), serial_number TEXT NOT NULL, status TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold', 'reserved', 'damaged', 'returned')), sale_id UUID, notes TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, product_id, serial_number))`,
      `CREATE TABLE IF NOT EXISTS product_relations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, related_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, relation_type TEXT NOT NULL CHECK (relation_type IN ('cross_sell', 'up_sell', 'substitute', 'component')), sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (product_id, related_product_id, relation_type))`,
      `CREATE TABLE IF NOT EXISTS customer_returns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, return_number TEXT NOT NULL, customer_id UUID REFERENCES customers(id), original_invoice_id UUID REFERENCES invoices(id), warehouse_id UUID NOT NULL REFERENCES warehouses(id), status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')), reason TEXT, notes TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS customer_return_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, return_id UUID NOT NULL REFERENCES customer_returns(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), quantity DECIMAL(14,4) NOT NULL, unit_price DECIMAL(14,2) NOT NULL, condition TEXT DEFAULT 'good' CHECK (condition IN ('good', 'damaged', 'defective')), restock BOOLEAN DEFAULT true, notes TEXT, created_at TIMESTAMPTZ DEFAULT now())`,

      // FASE 1: Fundamentos Críticos
      `CREATE TABLE IF NOT EXISTS product_boms (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, parent_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, component_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, quantity DECIMAL(14,4) NOT NULL DEFAULT 1, unit_of_measure TEXT DEFAULT 'UN', scrap_percent DECIMAL(5,2) DEFAULT 0, is_optional BOOLEAN DEFAULT false, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, parent_product_id, component_product_id))`,
      `CREATE TABLE IF NOT EXISTS inventory_valuation_methods (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, code TEXT NOT NULL, name TEXT NOT NULL, description TEXT, is_default BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, code))`,
      `CREATE TABLE IF NOT EXISTS valuation_layers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE, layer_date TIMESTAMPTZ NOT NULL DEFAULT now(), quantity_remaining DECIMAL(14,4) NOT NULL, unit_cost DECIMAL(14,4) NOT NULL, reference_type TEXT, reference_id UUID, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS inventory_valuation_runs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, valuation_method_id UUID REFERENCES inventory_valuation_methods(id), period_start TIMESTAMPTZ NOT NULL, period_end TIMESTAMPTZ NOT NULL, total_value DECIMAL(18,2) DEFAULT 0, status TEXT DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed')), notes TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now())`,

      // FASE 2: Operaciones Avanzadas
      `CREATE TABLE IF NOT EXISTS quality_checklists (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, aql_level TEXT DEFAULT '1.0', inspection_level TEXT DEFAULT 'normal', is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS quality_checklist_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, checklist_id UUID NOT NULL REFERENCES quality_checklists(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, item_type TEXT DEFAULT 'visual' CHECK (item_type IN ('visual', 'measurement', 'functional', 'documentation')), min_value DECIMAL(14,4), max_value DECIMAL(14,4), unit TEXT, sort_order INTEGER DEFAULT 0, is_required BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS quality_inspections (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, inspection_number TEXT NOT NULL, reference_type TEXT NOT NULL CHECK (reference_type IN ('receipt', 'production', 'shipment', 'return', 'internal')), reference_id UUID, purchase_order_id UUID REFERENCES purchase_orders(id), supplier_id UUID REFERENCES suppliers(id), warehouse_id UUID NOT NULL REFERENCES warehouses(id), checklist_id UUID REFERENCES quality_checklists(id), inspector_id UUID REFERENCES profiles(id), status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected')), sample_size INTEGER, accepted INTEGER, rejected INTEGER, notes TEXT, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, inspection_number))`,
      `CREATE TABLE IF NOT EXISTS quality_inspection_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, inspection_id UUID NOT NULL REFERENCES quality_inspections(id) ON DELETE CASCADE, checklist_item_id UUID REFERENCES quality_checklist_items(id), product_id UUID REFERENCES products(id), result TEXT DEFAULT 'pending' CHECK (result IN ('pending', 'pass', 'fail', 'na')), measured_value TEXT, notes TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,

      // FASE 2.2: Picking
      `CREATE TABLE IF NOT EXISTS pick_waves (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, wave_number TEXT NOT NULL, warehouse_id UUID NOT NULL REFERENCES warehouses(id), status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'released', 'in_progress', 'completed', 'cancelled')), priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')), assigned_to UUID REFERENCES profiles(id), total_tasks INTEGER DEFAULT 0, completed_tasks INTEGER DEFAULT 0, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, wave_number))`,
      `CREATE TABLE IF NOT EXISTS pick_tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, wave_id UUID REFERENCES pick_waves(id) ON DELETE SET NULL, warehouse_id UUID NOT NULL REFERENCES warehouses(id), order_id UUID REFERENCES sales_orders(id), delivery_guide_id UUID REFERENCES delivery_guides(id), product_id UUID NOT NULL REFERENCES products(id), zone_id UUID REFERENCES warehouse_zones(id), shelf_id UUID REFERENCES warehouse_shelves(id), position_id UUID REFERENCES warehouse_positions(id), quantity_requested DECIMAL(14,4) NOT NULL, quantity_picked DECIMAL(14,4) DEFAULT 0, status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'short', 'cancelled')), assigned_to UUID REFERENCES profiles(id), sequence INTEGER DEFAULT 0, notes TEXT, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,

      // FASE 2.3: Conteo Cíclico Programado
      `CREATE TABLE IF NOT EXISTS cycle_count_schedules (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')), abc_classification TEXT CHECK (abc_classification IN ('A', 'B', 'C')), category_id UUID REFERENCES inventory_categories(id), warehouse_id UUID NOT NULL REFERENCES warehouses(id), responsible_id UUID REFERENCES profiles(id), next_run_date DATE NOT NULL, last_run_date DATE, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS cycle_count_runs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, schedule_id UUID NOT NULL REFERENCES cycle_count_schedules(id) ON DELETE CASCADE, count_id UUID REFERENCES inventory_counts(id), status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')), notes TEXT, created_at TIMESTAMPTZ DEFAULT now(), completed_at TIMESTAMPTZ)`,

      // FASE 3: Cumplimiento y Finanzas
      `CREATE TABLE IF NOT EXISTS landed_cost_allocations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE, cost_type TEXT NOT NULL CHECK (cost_type IN ('freight', 'insurance', 'customs_duty', 'handling', 'other')), amount DECIMAL(14,2) NOT NULL, currency TEXT DEFAULT 'CLP', exchange_rate DECIMAL(14,6) DEFAULT 1, allocation_method TEXT DEFAULT 'value' CHECK (allocation_method IN ('value', 'weight', 'volume', 'quantity')), description TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS landed_cost_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, allocation_id UUID NOT NULL REFERENCES landed_cost_allocations(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), allocated_amount DECIMAL(14,4) NOT NULL, base_value DECIMAL(14,4), base_weight DECIMAL(14,4), base_volume DECIMAL(14,4), base_quantity DECIMAL(14,4), created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS consignment_agreements (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE, warehouse_id UUID NOT NULL REFERENCES warehouses(id), agreement_number TEXT NOT NULL, start_date DATE NOT NULL, end_date DATE, status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated')), commission_percent DECIMAL(5,2) DEFAULT 0, settlement_frequency TEXT DEFAULT 'monthly' CHECK (settlement_frequency IN ('weekly', 'monthly', 'quarterly')), notes TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, agreement_number))`,
      `CREATE TABLE IF NOT EXISTS consignment_stock (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, agreement_id UUID NOT NULL REFERENCES consignment_agreements(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), warehouse_id UUID NOT NULL REFERENCES warehouses(id), quantity_on_hand DECIMAL(14,4) DEFAULT 0, quantity_sold DECIMAL(14,4) DEFAULT 0, quantity_returned DECIMAL(14,4) DEFAULT 0, unit_cost DECIMAL(14,2) NOT NULL, last_settlement_date DATE, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, agreement_id, product_id, warehouse_id))`,
      `CREATE TABLE IF NOT EXISTS sii_inventory_book (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, period_year INTEGER NOT NULL, period_month INTEGER NOT NULL, book_number TEXT NOT NULL, status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected')), total_items INTEGER DEFAULT 0, total_value DECIMAL(18,2) DEFAULT 0, xml_content TEXT, response_xml TEXT, submitted_at TIMESTAMPTZ, submitted_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, period_year, period_month))`,
      `CREATE TABLE IF NOT EXISTS sii_inventory_book_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, book_id UUID NOT NULL REFERENCES sii_inventory_book(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id), warehouse_id UUID NOT NULL REFERENCES warehouses(id), quantity DECIMAL(14,4) NOT NULL, unit_cost DECIMAL(14,2) NOT NULL, total_value DECIMAL(18,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED, created_at TIMESTAMPTZ DEFAULT now())`,

      // FASE 4: Inteligencia y Escalabilidad
      `CREATE TABLE IF NOT EXISTS product_abc_classification (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, warehouse_id UUID REFERENCES warehouses(id), period_start DATE NOT NULL, period_end DATE NOT NULL, abc_class TEXT NOT NULL CHECK (abc_class IN ('A', 'B', 'C')), xyz_class TEXT NOT NULL CHECK (xyz_class IN ('X', 'Y', 'Z')), combined_class TEXT NOT NULL, annual_consumption_value DECIMAL(18,2), annual_consumption_qty DECIMAL(14,4), demand_variance DECIMAL(10,4), coefficient_of_variation DECIMAL(10,4), rank_position INTEGER, total_products INTEGER, cummulative_pct DECIMAL(5,2), calculated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, product_id, warehouse_id, period_start, period_end))`,
      `CREATE TABLE IF NOT EXISTS demand_forecasts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, warehouse_id UUID REFERENCES warehouses(id), forecast_date DATE NOT NULL, horizon_days INTEGER NOT NULL, forecast_qty DECIMAL(14,4) NOT NULL, lower_bound DECIMAL(14,4), upper_bound DECIMAL(14,4), model_type TEXT NOT NULL CHECK (model_type IN ('holt_winters', 'arima', 'moving_average', 'simple_exponential')), model_params JSONB, accuracy_mape DECIMAL(5,2), accuracy_rmse DECIMAL(14,4), trained_at TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, product_id, warehouse_id, forecast_date, horizon_days))`,
      `CREATE TABLE IF NOT EXISTS exchange_rates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, from_currency TEXT NOT NULL CHECK (from_currency ~ '^[A-Z]{3}$'), to_currency TEXT NOT NULL CHECK (to_currency ~ '^[A-Z]{3}$'), rate DECIMAL(18,6) NOT NULL, rate_date DATE NOT NULL, source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'mindicador', 'banco_central', 'fixer', 'exchangerate_api')), is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, from_currency, to_currency, rate_date))`,
      `CREATE TABLE IF NOT EXISTS valuation_multi_currency (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE, warehouse_id UUID NOT NULL REFERENCES warehouses(id), base_currency TEXT NOT NULL DEFAULT 'CLP' CHECK (base_currency ~ '^[A-Z]{3}$'), target_currency TEXT NOT NULL CHECK (target_currency ~ '^[A-Z]{3}$'), exchange_rate_id UUID REFERENCES exchange_rates(id), base_value DECIMAL(18,2) NOT NULL, target_value DECIMAL(18,2) NOT NULL, fx_gain_loss DECIMAL(18,2) GENERATED ALWAYS AS (target_value - base_value) STORED, valuation_date DATE NOT NULL DEFAULT CURRENT_DATE, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, product_id, warehouse_id, target_currency, valuation_date))`,

      // FASE 5: Experiencia y Extensibilidad
      `CREATE TABLE IF NOT EXISTS label_templates (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, width_mm DECIMAL(6,2) NOT NULL, height_mm DECIMAL(6,2) NOT NULL, margin_mm DECIMAL(6,2) DEFAULT 2, background_color TEXT DEFAULT '#FFFFFF', template_json JSONB NOT NULL DEFAULT '{}', is_default BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, name))`,
      `CREATE TABLE IF NOT EXISTS webhook_endpoints (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, url TEXT NOT NULL, secret TEXT NOT NULL, events TEXT[] NOT NULL, is_active BOOLEAN DEFAULT true, retry_count INTEGER DEFAULT 5, retry_base_delay_ms INTEGER DEFAULT 1000, last_triggered_at TIMESTAMPTZ, last_success_at TIMESTAMPTZ, last_failure_at TIMESTAMPTZ, consecutive_failures INTEGER DEFAULT 0, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS webhook_deliveries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE, event_type TEXT NOT NULL, payload JSONB NOT NULL, response_status INTEGER, response_body TEXT, attempt INTEGER DEFAULT 1, next_retry_at TIMESTAMPTZ, status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'abandoned')), error_message TEXT, created_at TIMESTAMPTZ DEFAULT now(), delivered_at TIMESTAMPTZ)`,
      `CREATE TABLE IF NOT EXISTS pwa_offline_queue (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, action_type TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id UUID, payload JSONB NOT NULL, status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed', 'conflict')), retry_count INTEGER DEFAULT 0, last_error TEXT, created_at TIMESTAMPTZ DEFAULT now(), synced_at TIMESTAMPTZ)`,

      // Registro de Ventas y Compras
      `CREATE TABLE IF NOT EXISTS sales_registers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, client TEXT NOT NULL, invoice_number TEXT NOT NULL, emission_date DATE NOT NULL DEFAULT CURRENT_DATE, status TEXT DEFAULT 'pagada' CHECK (status IN ('pagada', 'confirming', 'factoring')), payment_date DATE, net_amount DECIMAL(14,2) DEFAULT 0, total_amount DECIMAL(14,2) DEFAULT 0, guide_number TEXT, seller TEXT NOT NULL CHECK (seller IN ('FELIPE', 'MACA')), notes TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, invoice_number))`,
      `CREATE TABLE IF NOT EXISTS purchase_registers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, razon_social TEXT NOT NULL, rut TEXT, invoice_number TEXT NOT NULL, emission_date DATE NOT NULL DEFAULT CURRENT_DATE, status TEXT DEFAULT 'no_pagada' CHECK (status IN ('pagada', 'no_pagada')), amount DECIMAL(14,2) DEFAULT 0, area TEXT NOT NULL CHECK (area IN ('LOGISTICA', 'VERTIKAL', 'CASA', 'BRONCES')), payment_type TEXT NOT NULL CHECK (payment_type IN ('tarjeta_credito', 'tarjeta_debito', 'transferencia', 'efectivo', 'cheque', 'otro')), payment_date DATE, notes TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, invoice_number))`,
      `CREATE TABLE IF NOT EXISTS goods_receipts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, receipt_number TEXT NOT NULL, purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id), supplier_id UUID NOT NULL REFERENCES suppliers(id), warehouse_id UUID NOT NULL REFERENCES warehouses(id), status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'completed', 'cancelled')), received_date TIMESTAMPTZ DEFAULT now(), notes TEXT, created_by UUID REFERENCES profiles(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (company_id, receipt_number))`,
      `CREATE TABLE IF NOT EXISTS goods_receipt_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, receipt_id UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE, purchase_order_item_id UUID NOT NULL REFERENCES purchase_order_items(id), product_id UUID NOT NULL REFERENCES products(id), quantity_ordered DECIMAL(14,4) NOT NULL, quantity_received DECIMAL(14,4) NOT NULL, batch_number TEXT, notes TEXT, created_at TIMESTAMPTZ DEFAULT now())`,
    ];
    for (const sql of newTables) {
      try { await query(sql); } catch (e: any) { results.push(`WARN newTables: ${e.message?.substring(0, 100)}`); }
    }
    results.push(`Created ${newTables.length} new tables`);

    // ALTER TABLE migrations
    const alterStatements = [
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'invoices'::regclass AND attname = 'document_type') THEN ALTER TABLE invoices ADD COLUMN document_type TEXT DEFAULT 'factura' CHECK (document_type IN ('boleta', 'factura')); END IF; END $$`,
      `ALTER TABLE invoices ALTER COLUMN customer_id DROP NOT NULL`,
      `ALTER TABLE sales_orders ALTER COLUMN customer_id DROP NOT NULL`,
      `ALTER TABLE sales_orders ALTER COLUMN warehouse_id DROP NOT NULL`,
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_transfers') THEN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_transfers' AND column_name = 'product_id') THEN ALTER TABLE stock_transfers ADD COLUMN product_id UUID REFERENCES products(id); END IF; END IF; END $$`,
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_transfers') THEN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_transfers' AND column_name = 'from_warehouse_id') THEN ALTER TABLE stock_transfers ADD COLUMN from_warehouse_id UUID REFERENCES warehouses(id); END IF; END IF; END $$`,
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_transfers') THEN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_transfers' AND column_name = 'to_warehouse_id') THEN ALTER TABLE stock_transfers ADD COLUMN to_warehouse_id UUID REFERENCES warehouses(id); END IF; END IF; END $$`,
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_transfers') THEN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_transfers' AND column_name = 'quantity') THEN ALTER TABLE stock_transfers ADD COLUMN quantity NUMERIC(12,2); END IF; END IF; END $$`,
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_serials') THEN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_serials' AND column_name = 'batch_number') THEN ALTER TABLE product_serials ADD COLUMN batch_number TEXT; END IF; END IF; END $$`,
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_serials') THEN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_serials' AND column_name = 'updated_at') THEN ALTER TABLE product_serials ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now(); END IF; END IF; END $$`,
      `CREATE TABLE IF NOT EXISTS super_admins (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL, avatar_url TEXT, is_active BOOLEAN DEFAULT true, last_login_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role_type') THEN ALTER TABLE profiles ADD COLUMN role_type TEXT DEFAULT 'company' CHECK (role_type IN ('company', 'super_admin')); END IF; END $$`,
      `CREATE TABLE IF NOT EXISTS company_access_grants (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, super_admin_id UUID NOT NULL REFERENCES super_admins(id) ON DELETE CASCADE, granted_by UUID NOT NULL REFERENCES profiles(id), access_level TEXT DEFAULT 'read' CHECK (access_level IN ('read', 'full')), reason TEXT, expires_at TIMESTAMPTZ, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE(company_id, super_admin_id))`,
      `CREATE TABLE IF NOT EXISTS access_audit_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), super_admin_id UUID NOT NULL REFERENCES super_admins(id) ON DELETE CASCADE, company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, action TEXT NOT NULL CHECK (action IN ('login', 'access', 'modify', 'logout')), details JSONB, ip_address INET, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS platform_notifications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID REFERENCES companies(id) ON DELETE CASCADE, title TEXT NOT NULL, message TEXT NOT NULL, type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')), is_read BOOLEAN DEFAULT false, created_by UUID REFERENCES super_admins(id), created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS support_tickets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, subject TEXT NOT NULL, status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')), priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')), created_by UUID REFERENCES profiles(id), assigned_to UUID REFERENCES super_admins(id), created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS ticket_messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE, sender_type TEXT NOT NULL CHECK (sender_type IN ('company', 'super_admin')), sender_id UUID NOT NULL, message TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`,
      `CREATE TABLE IF NOT EXISTS platform_plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT UNIQUE NOT NULL, label TEXT NOT NULL, max_users INTEGER DEFAULT -1, price_monthly INTEGER DEFAULT 0, price_yearly INTEGER, features JSONB DEFAULT '[]', is_active BOOLEAN DEFAULT true, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`,
    ];
    for (const sql of alterStatements) {
      try { await query(sql); } catch { /* column may already exist */ }
    }
    results.push('Applied ALTER TABLE migrations');

    const permModules = ['inventario', 'ventas', 'compras', 'finanzas', 'herramientas', 'recetas', 'costos', 'rrhh', 'sistema'];
    const permActions = ['create', 'read', 'update', 'delete'];
    for (const mod of permModules) {
      for (const act of permActions) {
        await query(
          `INSERT INTO permissions (module, action, label, description) VALUES ($1, $2, $3, $4) ON CONFLICT (module, action) DO NOTHING`,
          [mod, act, `${act}_${mod}`, `${act} ${mod}`]
        );
      }
    }
    results.push('Seeded permissions');

    const passwordHash = await bcrypt.hash('admin123', 12);
    const companyResult = await query(
      `INSERT INTO companies (name, slug, plan, status) VALUES ('Yellow Technologies SpA', 'yellow-tech', 'professional', 'active') ON CONFLICT (slug) DO UPDATE SET name = 'Yellow Technologies SpA' RETURNING id`,
    );
    const companyId = companyResult.rows[0].id;
    results.push(`Company: ${companyId}`);

    const existingUser = await query('SELECT id FROM profiles WHERE email = $1', ['admin@yellow-erp.cl']);
    if (existingUser.rows.length === 0) {
      await query(
        `INSERT INTO profiles (company_id, email, full_name, password_hash, role, status) VALUES ($1, 'admin@yellow-erp.cl', 'Administrador', $2, 'owner', 'active')`,
        [companyId, passwordHash]
      );
      results.push('Created admin user');
    } else {
      results.push('Admin user already exists');
    }

    const roleResult = await query(
      `INSERT INTO roles (company_id, name, description, is_system) VALUES ($1, 'Admin', 'Administrador del sistema', true) ON CONFLICT (company_id, name) DO UPDATE SET name = 'Admin' RETURNING id`,
      [companyId]
    );
    const roleId = roleResult.rows[0].id;
    await query(`INSERT INTO role_permissions (role_id, permission_id) SELECT $1, id FROM permissions ON CONFLICT DO NOTHING`, [roleId]);
    results.push('Created Admin role with all permissions');

    const defaultReasons = ['Daño físico', 'Robo/Hurto', 'Merma natural', 'Vencimiento', 'Error de ingreso', 'Devolución cliente', 'Ajuste por inventario', 'Muestra/degustación', 'Donación', 'Otro'];
    for (const reason of defaultReasons) {
      await query(
        `INSERT INTO adjustment_reasons (company_id, name) VALUES ($1, $2) ON CONFLICT (company_id, name) DO NOTHING`,
        [companyId, reason]
      );
    }
    results.push('Seeded default adjustment reasons');

    const defaultValuationMethods = [
      { code: 'FIFO', name: 'FIFO (First In, First Out)', description: 'Los primeros en entrar son los primeros en salir' },
      { code: 'LIFO', name: 'LIFO (Last In, First Out)', description: 'Los últimos en entrar son los primeros en salir' },
      { code: 'WAC', name: 'Promedio Ponderado (WAC)', description: 'Costo promedio ponderado de todas las unidades' },
      { code: 'STANDARD', name: 'Costo Estándar', description: 'Costo predefinido por producto' },
    ];
    for (const method of defaultValuationMethods) {
      await query(
        `INSERT INTO inventory_valuation_methods (company_id, code, name, description, is_default) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (company_id, code) DO NOTHING`,
        [companyId, method.code, method.name, method.description, method.code === 'FIFO']
      );
    }
    results.push('Seeded default valuation methods');

    const superAdminHash = await bcrypt.hash('SuperAdmin123!', 12);
    const existingSuperAdmin = await query('SELECT id FROM super_admins WHERE email = $1', ['superadmin@yellow.cl']);
    if (existingSuperAdmin.rows.length === 0) {
      await query(
        `INSERT INTO super_admins (email, name, password_hash, is_active) VALUES ($1, $2, $3, true)`,
        ['superadmin@yellow.cl', 'Super Administrador', superAdminHash]
      );
      results.push('Created super admin: superadmin@yellow.cl / SuperAdmin123!');
    } else {
      results.push('Super admin already exists');
    }

    const defaultPlans = [
      { name: 'free', label: 'Free', max_users: 2, price_monthly: 0, price_yearly: 0, sort_order: 1, features: JSON.stringify(['Inventario basico', 'Facturacion limitada', 'Soporte por email']) },
      { name: 'starter', label: 'Starter', max_users: 5, price_monthly: 19990, price_yearly: 199900, sort_order: 2, features: JSON.stringify(['Inventario completo', 'Facturacion ilimitada', 'Reportes basicos', 'Soporte prioritario']) },
      { name: 'professional', label: 'Professional', max_users: 15, price_monthly: 49990, price_yearly: 499900, sort_order: 3, features: JSON.stringify(['Todo en Starter', 'Multi-warehouse', 'CRM', 'Payroll', 'Soporte 24/7']) },
      { name: 'enterprise', label: 'Enterprise', max_users: -1, price_monthly: 99990, price_yearly: 999900, sort_order: 4, features: JSON.stringify(['Todo en Professional', 'API access', 'Custom integrations', 'Dedicated support', 'SLA garantizado']) },
    ];
    for (const plan of defaultPlans) {
      await query(
        `INSERT INTO platform_plans (name, label, max_users, price_monthly, price_yearly, sort_order, features, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, true) ON CONFLICT (name) DO UPDATE SET label = $2, max_users = $3, price_monthly = $4, price_yearly = $5, sort_order = $6, features = $7`,
        [plan.name, plan.label, plan.max_users, plan.price_monthly, plan.price_yearly, plan.sort_order, plan.features]
      );
    }
    results.push('Seeded platform plans');

    const hrTables = [
      `CREATE TABLE IF NOT EXISTS hr_contracts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        contract_type TEXT DEFAULT 'indefinido' CHECK (contract_type IN ('indefinido', 'plazo_fijo', 'part_time', 'temporada', 'boleta_7a')),
        position TEXT,
        department TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        base_salary DECIMAL(14,2) DEFAULT 0,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'terminated', 'expired')),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS hr_attendance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'partial', 'vacation', 'sick_leave')),
        hours_worked DECIMAL(5,2) DEFAULT 0,
        overtime_hours DECIMAL(5,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE (company_id, employee_id, date)
      )`,
      `CREATE TABLE IF NOT EXISTS hr_evaluations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        evaluator_id UUID REFERENCES profiles(id),
        period TEXT NOT NULL,
        overall_score DECIMAL(3,2) DEFAULT 0,
        competencies_score DECIMAL(3,2) DEFAULT 0,
        goals_score DECIMAL(3,2) DEFAULT 0,
        comments TEXT,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'pending')),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS hr_training (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        trainer TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        max_participants INTEGER DEFAULT 20,
        current_participants INTEGER DEFAULT 0,
        type TEXT DEFAULT 'technical' CHECK (type IN ('technical', 'soft_skills', 'compliance', 'safety', 'onboarding')),
        status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS hr_onboarding (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE,
        mentor_name TEXT,
        notes TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dropped')),
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        tasks_total INTEGER DEFAULT 10,
        tasks_completed INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )`,
    ];

    for (const sql of hrTables) {
      try {
        await query(sql);
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          results.push(`HR table warning: ${e.message}`);
        }
      }
    }
    results.push('HR tables ensured');

    const internalOrderTables = [
      `CREATE TABLE IF NOT EXISTS internal_orders (
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
      )`,
      `CREATE TABLE IF NOT EXISTS internal_order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        order_id UUID NOT NULL REFERENCES internal_orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id),
        quantity DECIMAL(14,4) NOT NULL,
        fulfilled_quantity DECIMAL(14,4) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )`,
    ];

    for (const sql of internalOrderTables) {
      try {
        await query(sql);
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          results.push(`Internal Orders table warning: ${e.message}`);
        }
      }
    }
    results.push('Internal Orders tables ensured');

    const marginAlters = [
      `ALTER TABLE formulas ADD COLUMN IF NOT EXISTS min_margin_pct DECIMAL(5,2) DEFAULT NULL`,
      `ALTER TABLE formulas ADD COLUMN IF NOT EXISTS max_margin_pct DECIMAL(5,2) DEFAULT NULL`,
    ];

    for (const sql of marginAlters) {
      try { await query(sql); } catch (e: any) { results.push(`margin alter warn: ${e.message?.substring(0, 60)}`); }
    }
    results.push('Formulas margin columns ensured');

    const recipeExpensesTable = `
      CREATE TABLE IF NOT EXISTS recipe_expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        formula_id UUID REFERENCES formulas(id) ON DELETE SET NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(14,2) NOT NULL,
        expense_date DATE DEFAULT CURRENT_DATE,
        is_recurring BOOLEAN DEFAULT false,
        recurring_period VARCHAR(50),
        notes TEXT,
        created_by UUID REFERENCES profiles(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    try { await query(recipeExpensesTable); } catch (e: any) { results.push(`recipe_expenses warn: ${e.message?.substring(0, 60)}`); }
    try { await query('CREATE INDEX IF NOT EXISTS idx_recipe_expenses_company ON recipe_expenses(company_id)'); } catch {}
    try { await query('CREATE INDEX IF NOT EXISTS idx_recipe_expenses_formula ON recipe_expenses(formula_id)'); } catch {}
    results.push('Recipe expenses table ensured');

    const purchaseCategoriesTable = `
      CREATE TABLE IF NOT EXISTS purchase_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE (company_id, name)
      )
    `;
    try { await query(purchaseCategoriesTable); } catch (e: any) { results.push(`purchase_categories warn: ${e.message?.substring(0, 60)}`); }
    try { await query('CREATE INDEX IF NOT EXISTS idx_purchase_categories_company ON purchase_categories(company_id)'); } catch {}
    try { await query('ALTER TABLE purchase_categories ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL'); } catch {}
    results.push('Purchase categories table ensured');

    // 068: company_rubros
    const companyRubrosTable = `
      CREATE TABLE IF NOT EXISTS company_rubros (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE (company_id, name)
      )
    `;
    try { await query(companyRubrosTable); } catch (e: any) { results.push(`company_rubros warn: ${e.message?.substring(0, 60)}`); }
    try { await query('CREATE INDEX IF NOT EXISTS idx_company_rubros_company ON company_rubros(company_id)'); } catch {}
    try { await query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS rubro_id UUID REFERENCES company_rubros(id) ON DELETE SET NULL'); } catch {}
    try { await query('CREATE INDEX IF NOT EXISTS idx_customers_rubro ON customers(rubro_id)'); } catch {}
    results.push('Company rubros table ensured');

    // 072: condominiums module
    const condoTablesSql = `
      CREATE TABLE IF NOT EXISTS condos_properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        rut TEXT,
        address TEXT,
        commune TEXT,
        city TEXT,
        total_units INTEGER DEFAULT 0,
        reserve_fund_pct NUMERIC(5,2) DEFAULT 5.00,
        late_interest_pct NUMERIC(5,2) DEFAULT 1.50,
        due_day INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS condos_units (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
        unit_number TEXT NOT NULL,
        type TEXT DEFAULT 'apartment',
        owner_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        resident_name TEXT,
        resident_email TEXT,
        resident_phone TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS condos_coefficients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
        unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
        category TEXT DEFAULT 'general',
        percentage NUMERIC(8,5) DEFAULT 0.00000,
        coefficient_pct NUMERIC(8,5) DEFAULT 0.00000,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(unit_id, category)
      );

      CREATE TABLE IF NOT EXISTS condos_periods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
        period_code TEXT,
        period_date DATE DEFAULT CURRENT_DATE,
        year INTEGER,
        month INTEGER,
        status TEXT DEFAULT 'draft',
        due_date DATE,
        total_expenses_clp BIGINT DEFAULT 0,
        total_amount NUMERIC(12,2) DEFAULT 0,
        calculated_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS condos_expense_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
        period_id UUID NOT NULL REFERENCES condos_periods(id) ON DELETE CASCADE,
        name TEXT,
        category TEXT NOT NULL,
        description TEXT,
        amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        amount_clp BIGINT DEFAULT 0,
        amount_uf NUMERIC(12,4) DEFAULT 0,
        supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
        purchase_invoice_id UUID REFERENCES purchase_invoices(id) ON DELETE SET NULL,
        coefficient_category TEXT DEFAULT 'general',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS condos_unit_statements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        property_id UUID REFERENCES condos_properties(id) ON DELETE CASCADE,
        period_id UUID NOT NULL REFERENCES condos_periods(id) ON DELETE CASCADE,
        unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
        coefficient_pct NUMERIC(8,5) DEFAULT 0,
        common_expense NUMERIC(12,2) DEFAULT 0,
        reserve_fund NUMERIC(12,2) DEFAULT 0,
        previous_debt_clp BIGINT DEFAULT 0,
        late_interest_clp BIGINT DEFAULT 0,
        base_expense_clp BIGINT DEFAULT 0,
        variable_expense_clp BIGINT DEFAULT 0,
        reserve_fund_clp BIGINT DEFAULT 0,
        total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        total_clp BIGINT DEFAULT 0,
        amount_paid NUMERIC(12,2) DEFAULT 0,
        paid_clp BIGINT DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(period_id, unit_id)
      );

      CREATE TABLE IF NOT EXISTS condos_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        statement_id UUID NOT NULL REFERENCES condos_unit_statements(id) ON DELETE CASCADE,
        unit_id UUID REFERENCES condos_units(id) ON DELETE CASCADE,
        amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        amount_clp BIGINT DEFAULT 0,
        payment_method TEXT DEFAULT 'transfer',
        reference TEXT,
        reference_number TEXT,
        payment_date TIMESTAMPTZ DEFAULT now(),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      -- Assemblies (Ley 21.442)
      CREATE TABLE IF NOT EXISTS condos_assemblies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        assembly_date TIMESTAMPTZ NOT NULL,
        assembly_type TEXT DEFAULT 'ordinary',
        quorum_required_pct NUMERIC(5,2) DEFAULT 50.00,
        status TEXT DEFAULT 'scheduled',
        minutes_text TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS condos_assembly_proxies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        assembly_id UUID NOT NULL REFERENCES condos_assemblies(id) ON DELETE CASCADE,
        unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
        proxy_name TEXT NOT NULL,
        proxy_rut TEXT NOT NULL,
        document_url TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS condos_assembly_topics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        assembly_id UUID NOT NULL REFERENCES condos_assemblies(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        is_voting BOOLEAN DEFAULT true,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS condos_assembly_votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        topic_id UUID NOT NULL REFERENCES condos_assembly_topics(id) ON DELETE CASCADE,
        unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
        vote_option TEXT NOT NULL,
        alicuota_pct NUMERIC(8,5) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(topic_id, unit_id)
      );

      -- Utility Meters
      CREATE TABLE IF NOT EXISTS condos_utility_meters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
        unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
        meter_type TEXT NOT NULL,
        meter_number TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS condos_meter_readings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        meter_id UUID NOT NULL REFERENCES condos_utility_meters(id) ON DELETE CASCADE,
        period_id UUID NOT NULL REFERENCES condos_periods(id) ON DELETE CASCADE,
        unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
        previous_reading NUMERIC(12,2) DEFAULT 0,
        current_reading NUMERIC(12,2) DEFAULT 0,
        consumption NUMERIC(12,2) DEFAULT 0,
        unit_rate_clp NUMERIC(12,2) DEFAULT 0,
        total_clp BIGINT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      -- Violations & Fines
      CREATE TABLE IF NOT EXISTS condos_violations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
        unit_id UUID NOT NULL REFERENCES condos_units(id) ON DELETE CASCADE,
        infraction_description TEXT NOT NULL,
        fine_amount_clp BIGINT DEFAULT 0,
        fine_amount_uf NUMERIC(12,4) DEFAULT 0,
        status TEXT DEFAULT 'pending',
        period_id UUID REFERENCES condos_periods(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      -- Insurance Policies
      CREATE TABLE IF NOT EXISTS condos_insurance_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        property_id UUID NOT NULL REFERENCES condos_properties(id) ON DELETE CASCADE,
        insurer_name TEXT NOT NULL,
        policy_number TEXT NOT NULL,
        start_date DATE,
        end_date DATE,
        fire_coverage_clp BIGINT DEFAULT 0,
        premium_amount_clp BIGINT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;

    try {
      await query(condoTablesSql);
      results.push('Condominium tables created/ensured successfully');
    } catch (e: any) {
      results.push(`condos tables warn: ${e.message?.substring(0, 80)}`);
    }

    // 073: Banking & Fintoc Open Banking Chile
    const bankingTablesSql = `
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        bank_name TEXT NOT NULL,
        account_number TEXT NOT NULL,
        currency TEXT DEFAULT 'CLP',
        opening_balance_clp BIGINT DEFAULT 0,
        status TEXT DEFAULT 'active',
        fintoc_link_token TEXT,
        fintoc_account_id TEXT,
        last_synced_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS bank_statement_lines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
        statement_date DATE DEFAULT CURRENT_DATE,
        transaction_date TIMESTAMPTZ DEFAULT now(),
        description TEXT NOT NULL,
        amount_clp BIGINT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
        reference_number TEXT,
        category TEXT,
        source TEXT DEFAULT 'manual',
        match_status TEXT DEFAULT 'unmatched',
        matched_entry_id UUID,
        matched_amount_clp BIGINT DEFAULT 0,
        difference_clp BIGINT DEFAULT 0,
        fintoc_transaction_id TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS reconciliation_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
        statement_period TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        opening_balance_clp BIGINT DEFAULT 0,
        statement_balance_clp BIGINT DEFAULT 0,
        reconciled_amount_clp BIGINT DEFAULT 0,
        unmatched_amount_clp BIGINT DEFAULT 0,
        differences_clp BIGINT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        completed_at TIMESTAMPTZ
      );
    `;

    try {
      await query(bankingTablesSql);
      results.push('Banking and Fintoc Open Banking tables ensured successfully');
    } catch (e: any) {
      results.push(`banking tables warn: ${e.message?.substring(0, 80)}`);
    }

    // 074: Ecommerce Integrations & Supplier Portal
    const ecommerceTablesSql = `
      CREATE TABLE IF NOT EXISTS ecommerce_connections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        platform TEXT NOT NULL CHECK (platform IN ('shopify', 'woocommerce', 'mercadolibre', 'jumpseller')),
        store_name TEXT NOT NULL,
        store_url TEXT,
        api_key TEXT,
        api_secret TEXT,
        auto_issue_dte BOOLEAN DEFAULT true,
        default_warehouse_id UUID,
        is_active BOOLEAN DEFAULT true,
        last_synced_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS ecommerce_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        connection_id UUID REFERENCES ecommerce_connections(id) ON DELETE SET NULL,
        external_order_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_rut TEXT,
        customer_email TEXT,
        total_amount_clp BIGINT NOT NULL,
        status TEXT DEFAULT 'pending',
        dte_type TEXT DEFAULT 'boleta_electronica',
        dte_number TEXT,
        dte_sii_status TEXT DEFAULT 'aceptado',
        synced_at TIMESTAMPTZ DEFAULT now()
      );
    `;

    try {
      await query(ecommerceTablesSql);
      results.push('Ecommerce tables ensured successfully');
    } catch (e: any) {
      results.push(`ecommerce tables warn: ${e.message?.substring(0, 80)}`);
    }

    // Seed module catalog
    const moduleCatalog = [
      { name: 'erp', label: 'ERP & Gestión', description: 'Inventario, Ventas, Compras, CRM, Contabilidad' },
      { name: 'recetas', label: 'Recetas & Producción', description: 'Fórmulas BOM, Lotes de Producción, Costos' },
      { name: 'proyectos', label: 'Proyectos & Obras', description: 'Presupuestos, Hitos, Tableros Kanban' },
      { name: 'hr', label: 'RRHH & Sueldos', description: 'Contratos, Remuneraciones, Asistencia' },
      { name: 'condominio', label: 'Condominios', description: 'Gastos comunes, Copropiedad, Portal' },
      { name: 'restaurant', label: 'Restaurante & POS', description: 'Mesas, KDS, Comandas, QR' },
      { name: 'veterinaria', label: 'Veterinaria & Clínica', description: 'Pacientes, Consultas, Agenda' },
      { name: 'auto-talleres', label: 'Talleres Automotrices', description: 'Órdenes de Trabajo, Vehículos, Estimados, Técnicos' },
      { name: 'inventario', label: 'Inventario Avanzado', description: 'ABC, Kardex, Traslados, Conteo' },
      { name: 'ventas', label: 'Ventas & DTE', description: 'Facturación Electrónica, Cobranza' },
      { name: 'compras', label: 'Compras & Proveedores', description: 'Órdenes de Compra, Recepción' },
      { name: 'finanzas', label: 'Contabilidad', description: 'Libros SII, F29, Balance' },
      { name: 'herramientas', label: 'Herramientas', description: 'Reportes, Importaciones, Integraciones' },
      { name: 'costos', label: 'Costos & Centros', description: 'Centros de Costo, Landed Cost' },
      { name: 'sistema', label: 'Sistema', description: 'Usuarios, Roles, Permisos, Logs' },
      { name: 'mi-cuenta', label: 'Mi Cuenta SaaS', description: 'Suscripción, Facturación, Módulos' },
      { name: 'ayuda', label: 'Soporte & Ayuda', description: 'Tickets, Base de Conocimiento' },
    ];
    for (const mod of moduleCatalog) {
      await query(
        `INSERT INTO module_catalog (name, label, description) VALUES ($1, $2, $3)
         ON CONFLICT (name) DO UPDATE SET label = $2, description = $3`,
        [mod.name, mod.label, mod.description]
      );
    }
    results.push(`Seeded ${moduleCatalog.length} module catalog entries`);

    return NextResponse.json({ success: true, results });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

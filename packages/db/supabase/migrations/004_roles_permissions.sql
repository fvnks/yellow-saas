-- 004_roles_permissions.sql
-- Yellow ERP - Custom Roles & Granular Permissions

-- ============================================
-- ROLES (per company)
-- ============================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, name)
);

CREATE INDEX idx_roles_company ON roles(company_id);

-- ============================================
-- PERMISSIONS (global catalog)
-- ============================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(module, action)
);

-- ============================================
-- ROLE ↔ PERMISSIONS (many-to-many)
-- ============================================
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);

-- ============================================
-- USER ↔ ROLES (many-to-many per company)
-- ============================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role_id, company_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_company ON user_roles(company_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- ============================================
-- SEED: Default permissions for all modules
-- ============================================
INSERT INTO permissions (module, action, description) VALUES
-- Inventario
('inventory', 'create', 'Crear productos'),
('inventory', 'read', 'Ver productos'),
('inventory', 'update', 'Editar productos'),
('inventory', 'delete', 'Eliminar productos'),
-- Bodegas
('warehouses', 'create', 'Crear bodegas'),
('warehouses', 'read', 'Ver bodegas'),
('warehouses', 'update', 'Editar bodegas'),
('warehouses', 'delete', 'Eliminar bodegas'),
-- Ventas: Órdenes
('sales_orders', 'create', 'Crear órdenes de venta'),
('sales_orders', 'read', 'Ver órdenes de venta'),
('sales_orders', 'update', 'Editar órdenes de venta'),
('sales_orders', 'delete', 'Eliminar órdenes de venta'),
-- Ventas: Guías
('delivery_guides', 'create', 'Crear guías de despacho'),
('delivery_guides', 'read', 'Ver guías de despacho'),
('delivery_guides', 'update', 'Editar guías de despacho'),
('delivery_guides', 'delete', 'Eliminar guías de despacho'),
-- Ventas: Facturación
('invoices', 'create', 'Crear facturas'),
('invoices', 'read', 'Ver facturas'),
('invoices', 'update', 'Editar facturas'),
('invoices', 'delete', 'Eliminar facturas'),
-- Ventas: POS
('pos', 'create', 'Crear ventas POS'),
('pos', 'read', 'Ver ventas POS'),
('pos', 'update', 'Editar ventas POS'),
('pos', 'delete', 'Eliminar ventas POS'),
-- Compras: Órdenes
('purchase_orders', 'create', 'Crear órdenes de compra'),
('purchase_orders', 'read', 'Ver órdenes de compra'),
('purchase_orders', 'update', 'Editar órdenes de compra'),
('purchase_orders', 'delete', 'Eliminar órdenes de compra'),
-- Compras: Cotizaciones
('quotations', 'create', 'Crear cotizaciones'),
('quotations', 'read', 'Ver cotizaciones'),
('quotations', 'update', 'Editar cotizaciones'),
('quotations', 'delete', 'Eliminar cotizaciones'),
-- Clientes
('customers', 'create', 'Crear clientes'),
('customers', 'read', 'Ver clientes'),
('customers', 'update', 'Editar clientes'),
('customers', 'delete', 'Eliminar clientes'),
-- Proveedores
('suppliers', 'create', 'Crear proveedores'),
('suppliers', 'read', 'Ver proveedores'),
('suppliers', 'update', 'Editar proveedores'),
('suppliers', 'delete', 'Eliminar proveedores'),
-- CRM
('crm', 'create', 'Crear contactos CRM'),
('crm', 'read', 'Ver contactos CRM'),
('crm', 'update', 'Editar contactos CRM'),
('crm', 'delete', 'Eliminar contactos CRM'),
-- Listas de precio
('price_lists', 'create', 'Crear listas de precio'),
('price_lists', 'read', 'Ver listas de precio'),
('price_lists', 'update', 'Editar listas de precio'),
('price_lists', 'delete', 'Eliminar listas de precio'),
-- Nómina
('payroll', 'create', 'Crear registros de nómina'),
('payroll', 'read', 'Ver nómina'),
('payroll', 'update', 'Editar nómina'),
('payroll', 'delete', 'Eliminar nómina'),
-- Contabilidad
('accounting', 'create', 'Crear asientos contables'),
('accounting', 'read', 'Ver contabilidad'),
('accounting', 'update', 'Editar asientos contables'),
('accounting', 'delete', 'Eliminar asientos contables'),
-- Proyectos
('projects', 'create', 'Crear proyectos'),
('projects', 'read', 'Ver proyectos'),
('projects', 'update', 'Editar proyectos'),
('projects', 'delete', 'Eliminar proyectos'),
-- Reportes
('reports', 'read', 'Ver reportes'),
-- Auditoría
('audit', 'read', 'Ver auditoría'),
-- Configuración
('settings', 'read', 'Ver configuración'),
('settings', 'update', 'Editar configuración'),
-- Usuarios y Roles
('users', 'create', 'Invitar usuarios'),
('users', 'read', 'Ver usuarios'),
('users', 'update', 'Editar usuarios'),
('users', 'delete', 'Eliminar usuarios'),
('roles', 'create', 'Crear roles'),
('roles', 'read', 'Ver roles'),
('roles', 'update', 'Editar roles'),
('roles', 'delete', 'Eliminar roles');

-- ============================================
-- SEED: Default system roles per company
-- ============================================
-- We'll create default roles via API when company is created
-- but here we define the default role templates

-- RLS: Users can only see roles in their company
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_company_isolation" ON roles
    FOR ALL USING (company_id = current_company_id());

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_permissions_company_isolation" ON role_permissions
    FOR ALL USING (
        role_id IN (SELECT id FROM roles WHERE company_id = current_company_id())
    );

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_company_isolation" ON user_roles
    FOR ALL USING (company_id = current_company_id());

-- Permissions are global (no RLS needed - all companies see same permissions)
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissions_read_all" ON permissions FOR SELECT USING (true);

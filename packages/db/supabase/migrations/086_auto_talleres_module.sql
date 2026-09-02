-- Migration 086: Auto Repair Shop Module for Yellow ERP
-- Multi-tenant architecture with RLS policies and company_id scoping
-- Module: Talleres Automotrices — Órdenes de trabajo, vehículos, técnicos, estimados, inspecciones

-- ======================================================================
-- 0. VEHICLES / VEHÍCULOS
-- ======================================================================
CREATE TABLE IF NOT EXISTS auto_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    plate VARCHAR(20) NOT NULL,
    plate_type VARCHAR(20) DEFAULT 'normal' CHECK (plate_type IN ('normal', 'verde', 'negra', 'diplomatica', 'defensa', 'temporal')),
    vin VARCHAR(50),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(50),
    fuel_type VARCHAR(30) DEFAULT 'naftero' CHECK (fuel_type IN ('naftero', 'diesel', 'híbrido', 'eléctrico', 'gas')),
    transmission VARCHAR(30) DEFAULT 'manual' CHECK (transmission IN ('manual', 'automatica', 'cvt', 'semiautomatica')),
    mileage INT DEFAULT 0,
    engine_capacity VARCHAR(30),
    serial_number VARCHAR(100),
    chassis_number VARCHAR(100),
    observation TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, plate)
);

CREATE INDEX IF NOT EXISTS idx_auto_vehicles_company ON auto_vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_vehicles_client ON auto_vehicles(company_id, client_id);
CREATE INDEX IF NOT EXISTS idx_auto_vehicles_plate ON auto_vehicles(company_id, plate);

ALTER TABLE auto_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_vehicles_company_policy ON auto_vehicles
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- 1. WORK ORDERS / ÓRDENES DE TRABAJO
-- ======================================================================
CREATE TABLE IF NOT EXISTS auto_work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    order_number VARCHAR(30) NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES auto_vehicles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_writer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    bay_id UUID REFERENCES auto_bays(id) ON DELETE SET NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('baja', 'normal', 'alta', 'urgente')),
    status VARCHAR(30) DEFAULT 'checkin' CHECK (
        status IN ('checkin', 'diagnostic', 'estimated', 'approved', 'waiting_parts', 'in_progress', 'quality_check', 'ready', 'delivered', 'invoiced', 'cancelled')
    ),
    checkin_date TIMESTAMPTZ DEFAULT NOW(),
    estimated_completion_date TIMESTAMPTZ,
    actual_completion_date TIMESTAMPTZ,
    customer_complaint TEXT,
    diagnosis TEXT,
    notes TEXT,
    subtotal NUMERIC(12,0) NOT NULL DEFAULT 0,
    iva_pct NUMERIC(4,2) DEFAULT 19.00,
    iva_amount NUMERIC(12,0) NOT NULL DEFAULT 0,
    discount_pct NUMERIC(5,2) DEFAULT 0,
    discount_amount NUMERIC(12,0) NOT NULL DEFAULT 0,
    total NUMERIC(12,0) NOT NULL DEFAULT 0,
    dte_id UUID REFERENCES dtes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_auto_wo_company ON auto_work_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_wo_client ON auto_work_orders(company_id, client_id);
CREATE INDEX IF NOT EXISTS idx_auto_wo_status ON auto_work_orders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_auto_wo_checkin ON auto_work_orders(company_id, checkin_date DESC);

ALTER TABLE auto_work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_wo_company_policy ON auto_work_orders
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- 2. WORK ORDER ITEMS / ÍTEMS DE ORDEN DE TRABAJO
-- ======================================================================
CREATE TABLE IF NOT EXISTS auto_work_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES auto_work_orders(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('labor', 'part', 'service', 'product', 'fee')),
    description VARCHAR(500) NOT NULL,
    quantity NUMERIC(8,0) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,0) NOT NULL DEFAULT 0,
    discount_pct NUMERIC(5,2) DEFAULT 0,
    subtotal NUMERIC(12,0) NOT NULL DEFAULT 0,
    part_id UUID REFERENCES products(id) ON DELETE SET NULL,
    labor_technician_id UUID REFERENCES auto_technicians(id) ON DELETE SET NULL,
    labor_hours NUMERIC(6,2) DEFAULT 0,
    labor_rate_per_hour NUMERIC(12,0) DEFAULT 0,
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_woi_company ON auto_work_order_items(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_woi_wo ON auto_work_order_items(company_id, work_order_id);

ALTER TABLE auto_work_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_woi_company_policy ON auto_work_order_items
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- 3. ESTIMATES / ESTIMADOS / PRESUPUESTOS
-- ======================================================================
CREATE TABLE IF NOT EXISTS auto_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    estimate_number VARCHAR(30) NOT NULL,
    work_order_id UUID REFERENCES auto_work_orders(id) ON DELETE SET NULL,
    vehicle_id UUID NOT NULL REFERENCES auto_vehicles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    issue_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    subtotal NUMERIC(12,0) NOT NULL DEFAULT 0,
    iva_pct NUMERIC(4,2) DEFAULT 19.00,
    iva_amount NUMERIC(12,0) NOT NULL DEFAULT 0,
    discount_pct NUMERIC(5,2) DEFAULT 0,
    discount_amount NUMERIC(12,0) NOT NULL DEFAULT 0,
    total NUMERIC(12,0) NOT NULL DEFAULT 0,
    status VARCHAR(30) DEFAULT 'borrador' CHECK (
        status IN ('borrador', 'pendiente_aprobacion', 'aprobado', 'rechazado', 'expirado', 'convertido_a_ot')
    ),
    approved_at TIMESTAMPTZ,
    approved_by_ip INET,
    client_notes TEXT,
    shop_terms TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, estimate_number)
);

CREATE INDEX IF NOT EXISTS idx_auto_est_company ON auto_estimates(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_est_status ON auto_estimates(company_id, status);
CREATE INDEX IF NOT EXISTS idx_auto_est_client ON auto_estimates(company_id, client_id);

ALTER TABLE auto_estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_est_company_policy ON auto_estimates
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS auto_estimate_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    estimate_id UUID NOT NULL REFERENCES auto_estimates(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('labor', 'part', 'service', 'product', 'fee')),
    description VARCHAR(500) NOT NULL,
    quantity NUMERIC(8,0) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,0) NOT NULL DEFAULT 0,
    discount_pct NUMERIC(5,2) DEFAULT 0,
    subtotal NUMERIC(12,0) NOT NULL DEFAULT 0,
    part_id UUID REFERENCES products(id) ON DELETE SET NULL,
    labor_hours NUMERIC(6,2) DEFAULT 0,
    labor_rate_per_hour NUMERIC(12,0) DEFAULT 0,
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_esi_company ON auto_estimate_items(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_esi_est ON auto_estimate_items(company_id, estimate_id);

ALTER TABLE auto_estimate_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_esi_company_policy ON auto_estimate_items
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- 4. VEHICLE INSPECTIONS / INSPECCIONES VISUALES
-- ======================================================================
CREATE TABLE IF NOT EXISTS auto_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES auto_work_orders(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES auto_vehicles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    inspection_type VARCHAR(30) DEFAULT 'check_in' CHECK (inspection_type IN ('check_in', 'pre_repair', 'post_repair', 'delivery')),
    inspector_name VARCHAR(200),
    mileage_at_inspection INT,
    fuel_level VARCHAR(30) CHECK (fuel_level IN ('lleno', '3/4', '1/2', '1/4', 'vacío')),
    exterior_condition TEXT,
    interior_condition TEXT,
    damage_notes TEXT,
    existing_scratches TEXT,
    tire_condition VARCHAR(500),
    lights_working BOOLEAN DEFAULT TRUE,
    wipers_working BOOLEAN DEFAULT TRUE,
    ac_working BOOLEAN DEFAULT TRUE,
    dashboard_warnings BOOLEAN DEFAULT FALSE,
    general_notes TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'finalized')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_insp_company ON auto_inspections(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_insp_wo ON auto_inspections(company_id, work_order_id);

ALTER TABLE auto_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_insp_company_policy ON auto_inspections
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS auto_inspection_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    inspection_id UUID NOT NULL REFERENCES auto_inspections(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    description VARCHAR(200),
    zone VARCHAR(50) CHECK (zone IN ('frontal', 'trasera', 'lateral_izq', 'lateral_der', 'interior', 'motor', 'ruedas', 'tablero', 'otro')),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_insp_photo_company ON auto_inspection_photos(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_insp_photo_insp ON auto_inspection_photos(company_id, inspection_id);

ALTER TABLE auto_inspection_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_insp_photo_company_policy ON auto_inspection_photos
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- 5. TECHNICIANS / TÉCNICOS
-- ======================================================================
CREATE TABLE IF NOT EXISTS auto_technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rut VARCHAR(20),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    specialization VARCHAR(100),
    hourly_rate NUMERIC(12,0) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_tech_company ON auto_technicians(company_id);

ALTER TABLE auto_technicians ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_tech_company_policy ON auto_technicians
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- 6. BAYS / BAYS / TALLERES
-- ======================================================================
CREATE TABLE IF NOT EXISTS auto_bays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    number VARCHAR(20) NOT NULL,
    type VARCHAR(30) DEFAULT 'general' CHECK (type IN ('general', 'elevador', 'alineacion', 'pintura', 'chapa', 'motor', 'express')),
    capacity INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'inactive')),
    current_order_id UUID REFERENCES auto_work_orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, number)
);

CREATE INDEX IF NOT EXISTS idx_auto_bays_company ON auto_bays(company_id);

ALTER TABLE auto_bays ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_bays_company_policy ON auto_bays
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- 7. PARTS ORDERS / PEDIDOS DE REPUESTOS
-- ======================================================================
CREATE TABLE IF NOT EXISTS auto_parts_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    order_number VARCHAR(30) NOT NULL,
    work_order_id UUID REFERENCES auto_work_orders(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status VARCHAR(30) DEFAULT 'solicitado' CHECK (
        status IN ('solicitado', 'pedido', 'en_transito', 'recibido', 'cancelado', 'devuelto')
    ),
    total_cost NUMERIC(12,0) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_auto_po_company ON auto_parts_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_po_status ON auto_parts_orders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_auto_po_wo ON auto_parts_orders(company_id, work_order_id);

ALTER TABLE auto_parts_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_po_company_policy ON auto_parts_orders
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS auto_parts_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    parts_order_id UUID NOT NULL REFERENCES auto_parts_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    description VARCHAR(500) NOT NULL,
    quantity NUMERIC(8,0) NOT NULL DEFAULT 1,
    unit_cost NUMERIC(12,0) NOT NULL DEFAULT 0,
    unit_price NUMERIC(12,0) NOT NULL DEFAULT 0,
    received_quantity NUMERIC(8,0) DEFAULT 0,
    subtotal NUMERIC(12,0) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_poi_company ON auto_parts_order_items(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_poi_order ON auto_parts_order_items(company_id, parts_order_id);

ALTER TABLE auto_parts_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_poi_company_policy ON auto_parts_order_items
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- 8. TIME LOGS / REGISTRO DE TIEMPO DE TÉCNICOS
-- ======================================================================
CREATE TABLE IF NOT EXISTS auto_time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES auto_work_orders(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES auto_technicians(id) ON DELETE CASCADE,
    task_description VARCHAR(300),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    total_minutes INT GENERATED ALWAYS AS (
        CASE WHEN end_time IS NOT NULL THEN EXTRACT(EPOCH FROM (end_time - start_time)) / 60 ELSE 0 END
    ) STORED,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_tl_company ON auto_time_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_tl_wo ON auto_time_logs(company_id, work_order_id);
CREATE INDEX IF NOT EXISTS idx_auto_tl_tech ON auto_time_logs(company_id, technician_id);
CREATE INDEX IF NOT EXISTS idx_auto_tl_active ON auto_time_logs(company_id) WHERE status = 'active';

ALTER TABLE auto_time_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_tl_company_policy ON auto_time_logs
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- 9. SERVICE CALENDAR / AGENDA DE CITAS
-- ======================================================================
CREATE TABLE IF NOT EXISTS auto_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES auto_work_orders(id) ON DELETE SET NULL,
    vehicle_id UUID NOT NULL REFERENCES auto_vehicles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES auto_technicians(id) ON DELETE SET NULL,
    bay_id UUID REFERENCES auto_bays(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    appointment_type VARCHAR(30) DEFAULT 'reparacion' CHECK (appointment_type IN ('reparacion', 'mantencion', 'diagnostico', 'inspeccion', 'entrega')),
    status VARCHAR(20) DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'en_curso', 'completado', 'cancelado', 'no_asistio')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_appt_company ON auto_appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_appt_date ON auto_appointments(company_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_auto_appt_client ON auto_appointments(company_id, client_id);

ALTER TABLE auto_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_appt_company_policy ON auto_appointments
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- 10. SERVICE TYPE CATALOG / CATÁLOGO DE SERVICIOS
-- ======================================================================
CREATE TABLE IF NOT EXISTS auto_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'mantencion' CHECK (category IN ('mantencion', 'reparacion', 'diagnostico', 'chapa_pintura', 'electricidad', 'suspension', 'frenos', 'motor', 'transmision', 'otro')),
    estimated_hours NUMERIC(4,2) DEFAULT 0,
    base_price NUMERIC(12,0) DEFAULT 0,
    hourly_rate NUMERIC(12,0) DEFAULT 0,
    requires_estimates BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_svc_company ON auto_services(company_id);

ALTER TABLE auto_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_svc_company_policy ON auto_services
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- 11. WORK ORDER STATUS HISTORY / HISTORIAL DE ESTADOS
-- ======================================================================
CREATE TABLE IF NOT EXISTS auto_work_order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES auto_work_orders(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_wosh_company ON auto_work_order_status_history(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_wosh_wo ON auto_work_order_status_history(company_id, work_order_id);

ALTER TABLE auto_work_order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY auto_wosh_company_policy ON auto_work_order_status_history
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

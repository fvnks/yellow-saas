-- Migration 074: Veterinary Module for Yellow ERP
-- Multi-tenant architecture with RLS policies and company_id scoping

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Veterinary Species Catalog (Dynamic species per clinic)
CREATE TABLE IF NOT EXISTS veterinary_species (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) DEFAULT 'pequeños_animales',
    common_breeds TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, key)
);

-- 1. Veterinary Clients / Tutores (extending/linking ERP customers)
CREATE TABLE IF NOT EXISTS veterinary_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL, -- Optional link to standard ERP customer
    full_name VARCHAR(255) NOT NULL,
    rut VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    commune VARCHAR(100),
    city VARCHAR(100),
    secondary_contact_name VARCHAR(255),
    secondary_contact_phone VARCHAR(50),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Veterinary Patients / Mascotas
CREATE TABLE IF NOT EXISTS veterinary_patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES veterinary_clients(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    species VARCHAR(100) NOT NULL,
    breed VARCHAR(100),
    gender VARCHAR(20) CHECK (gender IN ('macho', 'hembra', 'desconocido')),
    birth_date DATE,
    color VARCHAR(100),
    current_weight_kg NUMERIC(6,2),
    microchip VARCHAR(100),
    registration_number VARCHAR(100),
    is_sterilized BOOLEAN DEFAULT FALSE,
    temperament VARCHAR(100),
    allergies TEXT,
    chronic_conditions TEXT,
    permanent_medications TEXT,
    diet TEXT,
    notes TEXT,
    photo_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deceased', 'adopted', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Veterinary Professionals
CREATE TABLE IF NOT EXISTS veterinary_professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    rut VARCHAR(20),
    professional_license VARCHAR(100), -- Registro Colegio Médico Vet / Certificado
    specialty VARCHAR(100) DEFAULT 'Medicina General',
    phone VARCHAR(50),
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'veterinario' CHECK (role IN ('veterinario', 'tecnico', 'asistente', 'cirujano', 'recepcion')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Veterinary Services Catalog
CREATE TABLE IF NOT EXISTS veterinary_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'consulta' CHECK (category IN ('consulta', 'vacunacion', 'desparasitacion', 'cirugia', 'hospitalizacion', 'examen', 'imagenologia', 'peluqueria', 'otro')),
    price_clp NUMERIC(12,2) NOT NULL DEFAULT 0,
    duration_minutes INT DEFAULT 30,
    requires_consent BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Veterinary Rooms / Boxes
CREATE TABLE IF NOT EXISTS veterinary_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'box' CHECK (type IN ('box', 'quirofano', 'hospitalizacion', 'laboratorio', 'peluqueria')),
    capacity INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Appointments / Agenda
CREATE TABLE IF NOT EXISTS veterinary_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES veterinary_clients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES veterinary_professionals(id) ON DELETE SET NULL,
    service_id UUID REFERENCES veterinary_services(id) ON DELETE SET NULL,
    room_id UUID REFERENCES veterinary_rooms(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    reason TEXT,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'agendada' CHECK (status IN ('agendada', 'confirmada', 'en_espera', 'en_atencion', 'finalizada', 'cancelada', 'no_asistio')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Consultations / Consultas Clínicas
CREATE TABLE IF NOT EXISTS veterinary_consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES veterinary_appointments(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES veterinary_clients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES veterinary_professionals(id) ON DELETE CASCADE,
    consultation_date TIMESTAMPTZ DEFAULT NOW(),
    reason_for_visit TEXT NOT NULL,
    anamnesis TEXT,
    weight_kg NUMERIC(6,2),
    temperature_c NUMERIC(4,1),
    heart_rate_bpm INT,
    respiratory_rate_bpm INT,
    capillary_refill_time_sec INT,
    mucous_membranes VARCHAR(50),
    body_condition VARCHAR(50), -- 1/5, 2/5, 3/5, 4/5, 5/5
    physical_exam_findings TEXT,
    primary_diagnosis TEXT,
    secondary_diagnoses TEXT,
    presumptive_diagnosis TEXT,
    treatment_plan TEXT,
    general_notes TEXT,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Vaccinations
CREATE TABLE IF NOT EXISTS veterinary_vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES veterinary_professionals(id) ON DELETE SET NULL,
    consultation_id UUID REFERENCES veterinary_consultations(id) ON DELETE SET NULL,
    vaccine_name VARCHAR(150) NOT NULL,
    manufacturer VARCHAR(150),
    batch_number VARCHAR(100),
    application_date DATE NOT NULL,
    next_due_date DATE,
    dose VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Dewormings / Desparasitaciones
CREATE TABLE IF NOT EXISTS veterinary_dewormings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES veterinary_professionals(id) ON DELETE SET NULL,
    product_name VARCHAR(150) NOT NULL,
    type VARCHAR(50) DEFAULT 'interna' CHECK (type IN ('interna', 'externa', 'ambas')),
    dose VARCHAR(50),
    application_date DATE NOT NULL,
    next_due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Prescriptions / Recetas Clínicas
CREATE TABLE IF NOT EXISTS veterinary_prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES veterinary_consultations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES veterinary_clients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES veterinary_professionals(id) ON DELETE CASCADE,
    prescription_date DATE DEFAULT CURRENT_DATE,
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'dispensed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS veterinary_prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES veterinary_prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    active_ingredient VARCHAR(200),
    presentation VARCHAR(100),
    dose VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    route VARCHAR(50) DEFAULT 'oral',
    quantity VARCHAR(50),
    special_instructions TEXT
);

-- 11. Surgeries / Cirugías
CREATE TABLE IF NOT EXISTS veterinary_surgeries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES veterinary_clients(id) ON DELETE CASCADE,
    surgeon_id UUID NOT NULL REFERENCES veterinary_professionals(id) ON DELETE CASCADE,
    anesthetist_id UUID REFERENCES veterinary_professionals(id) ON DELETE SET NULL,
    surgery_name VARCHAR(200) NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    room_id UUID REFERENCES veterinary_rooms(id) ON DELETE SET NULL,
    pre_op_evaluation TEXT,
    surgery_report TEXT,
    post_op_instructions TEXT,
    status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Hospitalizations / Hospitalización
CREATE TABLE IF NOT EXISTS veterinary_hospitalizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES veterinary_clients(id) ON DELETE CASCADE,
    attending_vet_id UUID NOT NULL REFERENCES veterinary_professionals(id) ON DELETE CASCADE,
    cage_number VARCHAR(50),
    admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    discharge_date TIMESTAMPTZ,
    initial_diagnosis TEXT,
    discharge_summary TEXT,
    priority VARCHAR(20) DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'critica')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'discharged', 'transferred', 'deceased')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS veterinary_hospitalization_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospitalization_id UUID NOT NULL REFERENCES veterinary_hospitalizations(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES veterinary_professionals(id) ON DELETE SET NULL,
    log_time TIMESTAMPTZ DEFAULT NOW(),
    temperature_c NUMERIC(4,1),
    heart_rate_bpm INT,
    respiratory_rate_bpm INT,
    feeding VARCHAR(100),
    hydration VARCHAR(100),
    medication_given TEXT,
    urinated BOOLEAN,
    defecated BOOLEAN,
    notes TEXT
);

-- 13. Reminders / Recordatorios
CREATE TABLE IF NOT EXISTS veterinary_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES veterinary_clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('vacunacion', 'desparasitacion', 'control', 'examen', 'cirugia', 'hospitalizacion', 'otro')),
    due_date DATE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for optimal multi-tenant performance
CREATE INDEX IF NOT EXISTS idx_vet_clients_company ON veterinary_clients(company_id);
CREATE INDEX IF NOT EXISTS idx_vet_patients_company ON veterinary_patients(company_id);
CREATE INDEX IF NOT EXISTS idx_vet_patients_client ON veterinary_patients(client_id);
CREATE INDEX IF NOT EXISTS idx_vet_appointments_company_date ON veterinary_appointments(company_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_vet_consultations_patient ON veterinary_consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_vet_vaccinations_patient ON veterinary_vaccinations(patient_id);
CREATE INDEX IF NOT EXISTS idx_vet_dewormings_patient ON veterinary_dewormings(patient_id);
CREATE INDEX IF NOT EXISTS idx_vet_surgeries_company ON veterinary_surgeries(company_id);
CREATE INDEX IF NOT EXISTS idx_vet_hosp_company ON veterinary_hospitalizations(company_id);
CREATE INDEX IF NOT EXISTS idx_vet_reminders_due ON veterinary_reminders(company_id, due_date);

-- Enable RLS on all veterinary tables
ALTER TABLE veterinary_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_dewormings ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_hospitalization_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinary_reminders ENABLE ROW LEVEL SECURITY;

-- Multi-tenant RLS Policies using user_companies pattern
CREATE POLICY vet_clients_company_policy ON veterinary_clients
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY vet_patients_company_policy ON veterinary_patients
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY vet_professionals_company_policy ON veterinary_professionals
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY vet_services_company_policy ON veterinary_services
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY vet_rooms_company_policy ON veterinary_rooms
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY vet_appointments_company_policy ON veterinary_appointments
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY vet_consultations_company_policy ON veterinary_consultations
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY vet_vaccinations_company_policy ON veterinary_vaccinations
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY vet_dewormings_company_policy ON veterinary_dewormings
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY vet_prescriptions_company_policy ON veterinary_prescriptions
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY vet_surgeries_company_policy ON veterinary_surgeries
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY vet_hospitalizations_company_policy ON veterinary_hospitalizations
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

CREATE POLICY vet_reminders_company_policy ON veterinary_reminders
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ==========================================================
-- Veterinary Clinical Evolutions (SOAP Notes) — Ley 21.020
-- ==========================================================
CREATE TABLE IF NOT EXISTS veterinary_evolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES veterinary_consultations(id) ON DELETE SET NULL,
    evolution_type VARCHAR(30) DEFAULT 'consulta' CHECK (evolution_type IN ('consulta', 'control', 'procedimiento', 'post_operatorio', 'hospitalizacion', 'examen')),
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    weight_kg NUMERIC(6,2),
    temperature_c NUMERIC(4,1),
    heart_rate_bpm INT,
    respiratory_rate_bpm INT,
    professional_id UUID REFERENCES veterinary_professionals(id) ON DELETE SET NULL,
    diagnosis VARCHAR(500),
    evolution_date DATE DEFAULT CURRENT_DATE,
    evolution_time TIME DEFAULT CURRENT_TIME,
    status VARCHAR(20) DEFAULT 'final' CHECK (status IN ('draft', 'final')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vet_evolutions_company ON veterinary_evolutions(company_id);
CREATE INDEX IF NOT EXISTS idx_vet_evolutions_patient ON veterinary_evolutions(company_id, patient_id, evolution_date);

ALTER TABLE veterinary_evolutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY vet_evolutions_company_policy ON veterinary_evolutions
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- Veterinary Estimates (Presupuestos & Cotizaciones)
-- ======================================================================
CREATE TABLE IF NOT EXISTS veterinary_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    estimate_number VARCHAR(30) NOT NULL,
    patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES veterinary_clients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES veterinary_professionals(id) ON DELETE SET NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    currency VARCHAR(5) DEFAULT 'CLP' CHECK (currency IN ('CLP', 'UF')),
    subtotal NUMERIC(12,0) NOT NULL DEFAULT 0,
    iva_pct NUMERIC(4,2) DEFAULT 19.00,
    total NUMERIC(12,0) NOT NULL DEFAULT 0,
    status VARCHAR(30) DEFAULT 'borrador' CHECK (status IN ('borrador', 'pendiente_aprobacion', 'aprobado', 'rechazado', 'expirado', 'convertido')),
    note TEXT,
    approved_at TIMESTAMPTZ,
    approved_by_ip INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, estimate_number)
);

CREATE INDEX IF NOT EXISTS idx_vet_estimates_company ON veterinary_estimates(company_id);
CREATE INDEX IF NOT EXISTS idx_vet_estimates_client ON veterinary_estimates(company_id, client_id);
CREATE INDEX IF NOT EXISTS idx_vet_estimates_status ON veterinary_estimates(company_id, status);

ALTER TABLE veterinary_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY vet_estimates_company_policy ON veterinary_estimates
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- Estimate Line Items
CREATE TABLE IF NOT EXISTS veterinary_estimate_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    estimate_id UUID NOT NULL REFERENCES veterinary_estimates(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(8,0) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,0) NOT NULL DEFAULT 0,
    subtotal NUMERIC(12,0) NOT NULL DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vet_est_items_company ON veterinary_estimate_items(company_id);
CREATE INDEX IF NOT EXISTS idx_vet_est_items_estimate ON veterinary_estimate_items(company_id, estimate_id);

ALTER TABLE veterinary_estimate_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY vet_est_items_company_policy ON veterinary_estimate_items
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- Veterinary Payments (Pagos & Anticipos)
-- ======================================================================
CREATE TABLE IF NOT EXISTS veterinary_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    estimate_id UUID REFERENCES veterinary_estimates(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES veterinary_clients(id) ON DELETE CASCADE,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    amount NUMERIC(12,0) NOT NULL CHECK (amount > 0),
    method VARCHAR(30) DEFAULT 'efectivo' CHECK (method IN ('efectivo', 'debito', 'credito_webpay', 'transbank_credito', 'transferencia', 'cheque', 'mercadopago')),
    concept TEXT NOT NULL,
    reference_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completado' CHECK (status IN ('completado', 'pendiente', 'reverso')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vet_payments_company ON veterinary_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_vet_payments_estimate ON veterinary_payments(company_id, estimate_id);
CREATE INDEX IF NOT EXISTS idx_vet_payments_client ON veterinary_payments(company_id, client_id);
CREATE INDEX IF NOT EXISTS idx_vet_payments_status ON veterinary_payments(company_id, status);

ALTER TABLE veterinary_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY vet_payments_company_policy ON veterinary_payments
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- Veterinary Laboratory - Lab Panels (Paneles de Examenes)
-- ======================================================================
CREATE TABLE IF NOT EXISTS veterinary_lab_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    category VARCHAR(30) CHECK (category IN ('hematologia', 'bioquimica', 'endocrinologia', 'urianalisis', 'parasitologia', 'citologia', 'serologia', 'otros')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, code)
);

CREATE INDEX IF NOT EXISTS idx_vet_lab_panels_company ON veterinary_lab_panels(company_id);

ALTER TABLE veterinary_lab_panels ENABLE ROW LEVEL SECURITY;

CREATE POLICY vet_lab_panels_company_policy ON veterinary_lab_panels
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- Individual Tests within a Panel
CREATE TABLE IF NOT EXISTS veterinary_lab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    panel_id UUID NOT NULL REFERENCES veterinary_lab_panels(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    unit VARCHAR(30),
    reference_range VARCHAR(100),
    reference_range_feline VARCHAR(100),
    reference_range_avian VARCHAR(100),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, panel_id, code)
);

CREATE INDEX IF NOT EXISTS idx_vet_lab_tests_company ON veterinary_lab_tests(company_id);
CREATE INDEX IF NOT EXISTS idx_vet_lab_tests_panel ON veterinary_lab_tests(company_id, panel_id);

ALTER TABLE veterinary_lab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY vet_lab_tests_company_policy ON veterinary_lab_tests
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- ======================================================================
-- Veterinary Laboratory - Orders & Results
-- ======================================================================
CREATE TABLE IF NOT EXISTS veterinary_lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    order_number VARCHAR(30) NOT NULL,
    patient_id UUID NOT NULL REFERENCES veterinary_patients(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES veterinary_clients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES veterinary_professionals(id) ON DELETE SET NULL,
    panel_id UUID NOT NULL REFERENCES veterinary_lab_panels(id) ON DELETE CASCADE,
    ordered_date DATE DEFAULT CURRENT_DATE,
    sampling_date DATE,
    sample_type VARCHAR(30) DEFAULT 'sangre' CHECK (sample_type IN ('sangre', 'orina', 'heces', 'raspado_piel', 'frotis_sanguineo', 'aspiracion', 'otro')),
    external_lab VARCHAR(200),
    priority VARCHAR(20) DEFAULT 'rutina' CHECK (priority IN ('rutina', 'urgencia', 'estatica')),
    status VARCHAR(30) DEFAULT 'ordenada' CHECK (status IN ('ordenada', 'muestra_tomada', 'en_proceso', 'resultados_listos', 'entregado', 'cancelada')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_vet_lab_orders_company ON veterinary_lab_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_vet_lab_orders_patient ON veterinary_lab_orders(company_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_vet_lab_orders_status ON veterinary_lab_orders(company_id, status);

ALTER TABLE veterinary_lab_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY vet_lab_orders_company_policy ON veterinary_lab_orders
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- Lab Results per Test
CREATE TABLE IF NOT EXISTS veterinary_lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES veterinary_lab_orders(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES veterinary_lab_tests(id) ON DELETE CASCADE,
    test_name VARCHAR(200) NOT NULL,
    value VARCHAR(100),
    unit VARCHAR(30),
    reference_range VARCHAR(100),
    flag VARCHAR(20) CHECK (flag IN ('bajo', 'normal', 'alto', 'critico')),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vet_lab_results_company ON veterinary_lab_results(company_id);
CREATE INDEX IF NOT EXISTS idx_vet_lab_results_order ON veterinary_lab_results(company_id, order_id);

ALTER TABLE veterinary_lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY vet_lab_results_company_policy ON veterinary_lab_results
    FOR ALL USING (company_id IN (SELECT company_id FROM user_companies WHERE user_id = auth.uid()));

-- Migration 074: Veterinary Module for Yellow ERP
-- Multi-tenant architecture with RLS policies and company_id scoping

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    species VARCHAR(50) NOT NULL CHECK (species IN ('perro', 'gato', 'ave', 'conejo', 'roedor', 'reptil', 'exotico', 'otro')),
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

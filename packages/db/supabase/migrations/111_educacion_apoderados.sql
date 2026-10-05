-- ============================================
-- MÓDULO EDUCATIVO: APODERADOS
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_apoderados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rut VARCHAR(12) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  ocupacion VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación Estudiante-Apoderado
CREATE TABLE IF NOT EXISTS educacion_estudiante_apoderado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id) ON DELETE CASCADE,
  apoderado_id UUID NOT NULL REFERENCES educacion_apoderados(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('padre', 'madre', 'tutor', 'apoderado_suplente')),
  es_apoderado_principal BOOLEAN DEFAULT FALSE,
  autorizado_retiro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(estudiante_id, apoderado_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_educacion_apoderados_company ON educacion_apoderados(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_apoderados_rut ON educacion_apoderados(rut);
CREATE INDEX IF NOT EXISTS idx_educacion_est_apoderado_estudiante ON educacion_estudiante_apoderado(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_educacion_est_apoderado_apoderado ON educacion_estudiante_apoderado(apoderado_id);

-- RLS
ALTER TABLE educacion_apoderados ENABLE ROW LEVEL SECURITY;
ALTER TABLE educacion_estudiante_apoderado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_apoderados_company_isolation" ON educacion_apoderados
  USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "educacion_estudiante_apoderado_company_isolation" ON educacion_estudiante_apoderado
  USING (estudiante_id IN (SELECT id FROM educacion_estudiantes WHERE company_id = current_setting('app.current_company_id')::UUID));

-- Triggers
CREATE OR REPLACE FUNCTION update_educacion_apoderados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_apoderados_updated_at
  BEFORE UPDATE ON educacion_apoderados
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_apoderados_updated_at();

-- ============================================
-- MÓDULO EDUCATIVO: ESTUDIANTES
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_estudiantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rut VARCHAR(12) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  fecha_nacimiento DATE NOT NULL,
  genero VARCHAR(20) CHECK (genero IN ('masculino', 'femenino', 'otro')),
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(255),
  curso_id UUID,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'retirado', 'suspendido')),
  fecha_ingreso DATE,
  fecha_retiro DATE,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_educacion_estudiantes_company ON educacion_estudiantes(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_estudiantes_curso ON educacion_estudiantes(curso_id);
CREATE INDEX IF NOT EXISTS idx_educacion_estudiantes_estado ON educacion_estudiantes(estado);
CREATE INDEX IF NOT EXISTS idx_educacion_estudiantes_rut ON educacion_estudiantes(rut);

-- RLS
ALTER TABLE educacion_estudiantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_estudiantes_company_isolation" ON educacion_estudiantes
  USING (company_id = current_setting('app.current_company_id')::UUID);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_educacion_estudiantes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_estudiantes_updated_at
  BEFORE UPDATE ON educacion_estudiantes
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_estudiantes_updated_at();

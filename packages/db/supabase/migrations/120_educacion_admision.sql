-- ============================================
-- MÓDULO EDUCATIVO: ADMISIÓN
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_postulaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  estudiante_nombres VARCHAR(100) NOT NULL,
  estudiante_apellido_paterno VARCHAR(100) NOT NULL,
  estudiante_apellido_materno VARCHAR(100),
  estudiante_fecha_nacimiento DATE,
  apoderado_nombres VARCHAR(100),
  apoderado_apellido_paterno VARCHAR(100),
  apoderado_email VARCHAR(255),
  apoderado_telefono VARCHAR(20),
  nivel_postulacion VARCHAR(50),
  anio_postulacion INTEGER,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada', 'lista_espera')),
  fecha_postulacion DATE DEFAULT CURRENT_DATE,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_educacion_postulaciones_company ON educacion_postulaciones(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_postulaciones_estado ON educacion_postulaciones(estado);
CREATE INDEX IF NOT EXISTS idx_educacion_postulaciones_nivel ON educacion_postulaciones(nivel_postulacion);
CREATE INDEX IF NOT EXISTS idx_educacion_postulaciones_fecha ON educacion_postulaciones(fecha_postulacion);

-- RLS
ALTER TABLE educacion_postulaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_postulaciones_company_isolation" ON educacion_postulaciones
  USING (company_id = current_setting('app.current_company_id')::UUID);

-- Triggers
CREATE OR REPLACE FUNCTION update_educacion_postulaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_postulaciones_updated_at
  BEFORE UPDATE ON educacion_postulaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_postulaciones_updated_at();

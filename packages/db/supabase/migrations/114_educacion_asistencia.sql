-- ============================================
-- MÓDULO EDUCATIVO: ASISTENCIA
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_asistencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES educacion_cursos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('presente', 'ausente', 'atrasado', 'justificado')),
  justificacion TEXT,
  justificado_por UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(estudiante_id, fecha)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_educacion_asistencia_company ON educacion_asistencia(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_asistencia_estudiante ON educacion_asistencia(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_educacion_asistencia_curso ON educacion_asistencia(curso_id);
CREATE INDEX IF NOT EXISTS idx_educacion_asistencia_fecha ON educacion_asistencia(fecha);
CREATE INDEX IF NOT EXISTS idx_educacion_asistencia_estado ON educacion_asistencia(estado);

-- RLS
ALTER TABLE educacion_asistencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_asistencia_company_isolation" ON educacion_asistencia
  USING (company_id = current_setting('app.current_company_id')::UUID);

-- Triggers
CREATE OR REPLACE FUNCTION update_educacion_asistencia_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_asistencia_updated_at
  BEFORE UPDATE ON educacion_asistencia
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_asistencia_updated_at();

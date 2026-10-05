-- ============================================
-- MÓDULO EDUCATIVO: CALIFICACIONES Y ANOTACIONES
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_calificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id) ON DELETE CASCADE,
  curso_asignatura_id UUID NOT NULL REFERENCES educacion_curso_asignatura(id) ON DELETE CASCADE,
  periodo INTEGER NOT NULL,
  anio_lectivo INTEGER NOT NULL,
  nota DECIMAL(3,1) NOT NULL CHECK (nota >= 1.0 AND nota <= 7.0),
  tipo_evaluacion VARCHAR(50) NOT NULL,
  descripcion TEXT,
  fecha_evaluacion DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(estudiante_id, curso_asignatura_id, periodo, tipo_evaluacion, descripcion)
);

-- Anotaciones (Libro de clases)
CREATE TABLE IF NOT EXISTS educacion_anotaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES educacion_cursos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('positiva', 'negativa')),
  descripcion TEXT NOT NULL,
  registrada_por UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_educacion_calificaciones_company ON educacion_calificaciones(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_calificaciones_estudiante ON educacion_calificaciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_educacion_calificaciones_curso_asignatura ON educacion_calificaciones(curso_asignatura_id);
CREATE INDEX IF NOT EXISTS idx_educacion_calificaciones_periodo ON educacion_calificaciones(periodo);
CREATE INDEX IF NOT EXISTS idx_educacion_calificaciones_anio ON educacion_calificaciones(anio_lectivo);
CREATE INDEX IF NOT EXISTS idx_educacion_anotaciones_company ON educacion_anotaciones(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_anotaciones_estudiante ON educacion_anotaciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_educacion_anotaciones_fecha ON educacion_anotaciones(fecha);

-- RLS
ALTER TABLE educacion_calificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE educacion_anotaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_calificaciones_company_isolation" ON educacion_calificaciones
  USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "educacion_anotaciones_company_isolation" ON educacion_anotaciones
  USING (company_id = current_setting('app.current_company_id')::UUID);

-- Triggers
CREATE OR REPLACE FUNCTION update_educacion_calificaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_calificaciones_updated_at
  BEFORE UPDATE ON educacion_calificaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_calificaciones_updated_at();

-- ============================================
-- MÓDULO EDUCATIVO: ASIGNATURAS
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_asignaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  codigo VARCHAR(20),
  nombre VARCHAR(100) NOT NULL,
  nivel VARCHAR(50),
  horas_semanales INTEGER,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asignación de asignaturas a cursos
CREATE TABLE IF NOT EXISTS educacion_curso_asignatura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES educacion_cursos(id) ON DELETE CASCADE,
  asignatura_id UUID NOT NULL REFERENCES educacion_asignaturas(id) ON DELETE CASCADE,
  profesor_id UUID REFERENCES educacion_profesores(id),
  anio_lectivo INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(curso_id, asignatura_id, anio_lectivo)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_educacion_asignaturas_company ON educacion_asignaturas(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_curso_asignatura_curso ON educacion_curso_asignatura(curso_id);
CREATE INDEX IF NOT EXISTS idx_educacion_curso_asignatura_asignatura ON educacion_curso_asignatura(asignatura_id);
CREATE INDEX IF NOT EXISTS idx_educacion_curso_asignatura_profesor ON educacion_curso_asignatura(profesor_id);

-- RLS
ALTER TABLE educacion_asignaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE educacion_curso_asignatura ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_asignaturas_company_isolation" ON educacion_asignaturas
  USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "educacion_curso_asignatura_company_isolation" ON educacion_curso_asignatura
  USING (curso_id IN (SELECT id FROM educacion_cursos WHERE company_id = current_setting('app.current_company_id')::UUID));

-- Triggers
CREATE OR REPLACE FUNCTION update_educacion_asignaturas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_asignaturas_updated_at
  BEFORE UPDATE ON educacion_asignaturas
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_asignaturas_updated_at();

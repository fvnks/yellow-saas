-- ============================================
-- MÓDULO EDUCATIVO: CURSOS Y PROFESORES
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  nivel VARCHAR(50) NOT NULL CHECK (nivel IN ('parvularia', 'basica', 'media')),
  jornada VARCHAR(50) CHECK (jornada IN ('manana', 'tarde', 'completa')),
  profesor_jefe_id UUID,
  anio_lectivo INTEGER NOT NULL,
  cupo_maximo INTEGER,
  sala VARCHAR(50),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS educacion_profesores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rut VARCHAR(12) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  email VARCHAR(255),
  telefono VARCHAR(20),
  especialidad VARCHAR(100),
  titulo VARCHAR(255),
  fecha_ingreso DATE,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar FK de profesor_jefe después de crear profesores
ALTER TABLE educacion_cursos
  ADD CONSTRAINT fk_educacion_cursos_profesor_jefe
  FOREIGN KEY (profesor_jefe_id) REFERENCES educacion_profesores(id);

-- Actualizar FK de curso_id en estudiantes
ALTER TABLE educacion_estudiantes
  ADD CONSTRAINT fk_educacion_estudiantes_curso
  FOREIGN KEY (curso_id) REFERENCES educacion_cursos(id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_educacion_cursos_company ON educacion_cursos(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_cursos_nivel ON educacion_cursos(nivel);
CREATE INDEX IF NOT EXISTS idx_educacion_cursos_anio ON educacion_cursos(anio_lectivo);
CREATE INDEX IF NOT EXISTS idx_educacion_profesores_company ON educacion_profesores(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_profesores_estado ON educacion_profesores(estado);

-- RLS
ALTER TABLE educacion_cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE educacion_profesores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_cursos_company_isolation" ON educacion_cursos
  USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "educacion_profesores_company_isolation" ON educacion_profesores
  USING (company_id = current_setting('app.current_company_id')::UUID);

-- Triggers
CREATE OR REPLACE FUNCTION update_educacion_cursos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_cursos_updated_at
  BEFORE UPDATE ON educacion_cursos
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_cursos_updated_at();

CREATE OR REPLACE FUNCTION update_educacion_profesores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_profesores_updated_at
  BEFORE UPDATE ON educacion_profesores
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_profesores_updated_at();

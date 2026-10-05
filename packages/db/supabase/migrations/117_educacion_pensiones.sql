-- ============================================
-- MÓDULO EDUCATIVO: MATRÍCULAS Y PENSIONES
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES educacion_cursos(id) ON DELETE CASCADE,
  anio_lectivo INTEGER NOT NULL,
  fecha_matricula DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'vigente' CHECK (estado IN ('vigente', 'cancelada', 'traspasada')),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS educacion_pensiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  anio INTEGER NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'vencida', 'anulada')),
  fecha_pago DATE,
  metodo_pago VARCHAR(50),
  dte_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(estudiante_id, mes, anio)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_educacion_matriculas_company ON educacion_matriculas(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_matriculas_estudiante ON educacion_matriculas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_educacion_matriculas_curso ON educacion_matriculas(curso_id);
CREATE INDEX IF NOT EXISTS idx_educacion_matriculas_anio ON educacion_matriculas(anio_lectivo);
CREATE INDEX IF NOT EXISTS idx_educacion_pensiones_company ON educacion_pensiones(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_pensiones_estudiante ON educacion_pensiones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_educacion_pensiones_estado ON educacion_pensiones(estado);
CREATE INDEX IF NOT EXISTS idx_educacion_pensiones_fecha_vencimiento ON educacion_pensiones(fecha_vencimiento);

-- RLS
ALTER TABLE educacion_matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE educacion_pensiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_matriculas_company_isolation" ON educacion_matriculas
  USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "educacion_pensiones_company_isolation" ON educacion_pensiones
  USING (company_id = current_setting('app.current_company_id')::UUID);

-- Triggers
CREATE OR REPLACE FUNCTION update_educacion_matriculas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_matriculas_updated_at
  BEFORE UPDATE ON educacion_matriculas
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_matriculas_updated_at();

CREATE OR REPLACE FUNCTION update_educacion_pensiones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_pensiones_updated_at
  BEFORE UPDATE ON educacion_pensiones
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_pensiones_updated_at();

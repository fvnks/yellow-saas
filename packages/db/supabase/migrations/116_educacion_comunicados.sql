-- ============================================
-- MÓDULO EDUCATIVO: COMUNICADOS
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_comunicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('general', 'por_curso', 'por_nivel')),
  curso_id UUID REFERENCES educacion_cursos(id),
  nivel VARCHAR(50),
  fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  publicado_por UUID,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_educacion_comunicados_company ON educacion_comunicados(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_comunicados_tipo ON educacion_comunicados(tipo);
CREATE INDEX IF NOT EXISTS idx_educacion_comunicados_curso ON educacion_comunicados(curso_id);
CREATE INDEX IF NOT EXISTS idx_educacion_comunicados_fecha ON educacion_comunicados(fecha_publicacion);

-- RLS
ALTER TABLE educacion_comunicados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_comunicados_company_isolation" ON educacion_comunicados
  USING (company_id = current_setting('app.current_company_id')::UUID);

-- Triggers
CREATE OR REPLACE FUNCTION update_educacion_comunicados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_comunicados_updated_at
  BEFORE UPDATE ON educacion_comunicados
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_comunicados_updated_at();

-- ============================================
-- MÓDULO EDUCATIVO: EVENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('reunion', 'celebracion', 'salida_pedagogica', 'otro')),
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_termino TIMESTAMP WITH TIME ZONE,
  curso_id UUID REFERENCES educacion_cursos(id),
  ubicacion VARCHAR(255),
  requiere_autorizacion BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_educacion_eventos_company ON educacion_eventos(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_eventos_fecha ON educacion_eventos(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_educacion_eventos_curso ON educacion_eventos(curso_id);
CREATE INDEX IF NOT EXISTS idx_educacion_eventos_tipo ON educacion_eventos(tipo);

-- RLS
ALTER TABLE educacion_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_eventos_company_isolation" ON educacion_eventos
  USING (company_id = current_setting('app.current_company_id')::UUID);

-- Triggers
CREATE OR REPLACE FUNCTION update_educacion_eventos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_eventos_updated_at
  BEFORE UPDATE ON educacion_eventos
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_eventos_updated_at();

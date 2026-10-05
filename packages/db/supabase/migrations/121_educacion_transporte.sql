-- ============================================
-- MÓDULO EDUCATIVO: TRANSPORTE ESCOLAR
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_transporte_rutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  conductor VARCHAR(100),
  patente VARCHAR(20),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS educacion_transporte_paraderos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruta_id UUID NOT NULL REFERENCES educacion_transporte_rutas(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  direccion TEXT,
  hora_recogida TIME,
  orden INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS educacion_transporte_estudiantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES educacion_estudiantes(id) ON DELETE CASCADE,
  ruta_id UUID NOT NULL REFERENCES educacion_transporte_rutas(id) ON DELETE CASCADE,
  paradero_id UUID REFERENCES educacion_transporte_paraderos(id),
  anio_lectivo INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(estudiante_id, anio_lectivo)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_educacion_transporte_rutas_company ON educacion_transporte_rutas(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_transporte_paraderos_ruta ON educacion_transporte_paraderos(ruta_id);
CREATE INDEX IF NOT EXISTS idx_educacion_transporte_estudiantes_estudiante ON educacion_transporte_estudiantes(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_educacion_transporte_estudiantes_ruta ON educacion_transporte_estudiantes(ruta_id);

-- RLS
ALTER TABLE educacion_transporte_rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE educacion_transporte_paraderos ENABLE ROW LEVEL SECURITY;
ALTER TABLE educacion_transporte_estudiantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_transporte_rutas_company_isolation" ON educacion_transporte_rutas
  USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY "educacion_transporte_paraderos_company_isolation" ON educacion_transporte_paraderos
  USING (ruta_id IN (SELECT id FROM educacion_transporte_rutas WHERE company_id = current_setting('app.current_company_id')::UUID));

CREATE POLICY "educacion_transporte_estudiantes_company_isolation" ON educacion_transporte_estudiantes
  USING (estudiante_id IN (SELECT id FROM educacion_estudiantes WHERE company_id = current_setting('app.current_company_id')::UUID));

-- Triggers
CREATE OR REPLACE FUNCTION update_educacion_transporte_rutas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_transporte_rutas_updated_at
  BEFORE UPDATE ON educacion_transporte_rutas
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_transporte_rutas_updated_at();

-- ============================================
-- MÓDULO EDUCATIVO: SUBVENCIONES
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_subvenciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  anio INTEGER NOT NULL,
  monto DECIMAL(12,2),
  estado VARCHAR(20) CHECK (estado IN ('solicitada', 'aprobada', 'recibida')),
  fecha_recepcion DATE,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_educacion_subvenciones_company ON educacion_subvenciones(company_id);
CREATE INDEX IF NOT EXISTS idx_educacion_subvenciones_anio ON educacion_subvenciones(anio);
CREATE INDEX IF NOT EXISTS idx_educacion_subvenciones_tipo ON educacion_subvenciones(tipo);

-- RLS
ALTER TABLE educacion_subvenciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_subvenciones_company_isolation" ON educacion_subvenciones
  USING (company_id = current_setting('app.current_company_id')::UUID);

-- Triggers
CREATE OR REPLACE FUNCTION update_educacion_subvenciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_educacion_subvenciones_updated_at
  BEFORE UPDATE ON educacion_subvenciones
  FOR EACH ROW
  EXECUTE FUNCTION update_educacion_subvenciones_updated_at();

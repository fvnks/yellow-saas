-- ============================================
-- MÓDULO EDUCATIVO: CONFIGURACIÓN DEL ESTABLECIMIENTO
-- Guarda los datos del colegio (perfil, año lectivo, pensiones,
-- notificaciones y email) en una fila por empresa.
-- ============================================

CREATE TABLE IF NOT EXISTS educacion_configuracion (
  company_id UUID PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  datos JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE educacion_configuracion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educacion_configuracion_company_isolation" ON educacion_configuracion
  USING (company_id = current_setting('app.current_company_id', true)::UUID);

COMMENT ON TABLE educacion_configuracion IS 'Configuración del módulo educativo por empresa (JSONB)';
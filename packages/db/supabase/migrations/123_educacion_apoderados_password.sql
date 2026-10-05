-- ============================================
-- MÓDULO EDUCATIVO: AGREGAR PASSWORD A APODERADOS
-- ============================================

-- Agregar columna de contraseña a la tabla de apoderados
ALTER TABLE educacion_apoderados 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Crear índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_educacion_apoderados_email 
ON educacion_apoderados(email);

-- Comentario sobre la columna
COMMENT ON COLUMN educacion_apoderados.password IS 'Contraseña hasheada del apoderado para acceso al portal';

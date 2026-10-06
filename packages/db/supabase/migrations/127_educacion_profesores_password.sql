-- ============================================
-- MÓDULO EDUCATIVO: AGREGAR PASSWORD A PROFESORES
-- ============================================

-- Agregar columna de contraseña a la tabla de profesores
ALTER TABLE educacion_profesores 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Crear índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_educacion_profesores_email 
ON educacion_profesores(email);

-- Comentario sobre la columna
COMMENT ON COLUMN educacion_profesores.password IS 'Contraseña hasheada del profesor para acceso al portal';

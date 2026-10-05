-- ============================================
-- PORTAL APODERADOS: regla de "un hijo, un apoderado"
-- ============================================

-- Un estudiante no puede ser reclamado por dos apoderados distintos.
-- El índice único lo garantiza incluso ante dos solicitudes concurrentes de
-- registro (dos padres distintos intentando enlazar al mismo niño).
CREATE UNIQUE INDEX IF NOT EXISTS uq_educacion_estudiante_apoderado_estudiante
  ON educacion_estudiante_apoderado (estudiante_id);

-- Email de apoderado único sin distinguir mayúsculas, para que el registro
-- público no permita duplicar cuentas con "Juan@x.cl" y "juan@x.cl".
CREATE UNIQUE INDEX IF NOT EXISTS uq_educacion_apoderados_email
  ON educacion_apoderados (lower(email))
  WHERE email IS NOT NULL AND email <> '';

#!/bin/bash
# ============================================
# Script para ejecutar migraciones del módulo educativo en el VPS
# Ejecutar en el VPS donde está la base de datos PostgreSQL
# ============================================

echo "=== Migraciones del Módulo Educativo ==="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "packages/db/supabase/migrations" ]; then
  echo "❌ Error: No se encontró el directorio de migraciones"
  echo "   Ejecuta este script desde la raíz del proyecto"
  exit 1
fi

# Variables de conexión (ajustar según tu configuración)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Si no hay contraseña, intentar obtenerla del archivo .env.local
if [ -z "$DB_PASSWORD" ] && [ -f ".env.local" ]; then
  DB_PASSWORD=$(grep "^DATABASE_URL=" .env.local | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/')
fi

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ Error: No se encontró la contraseña de la base de datos"
  echo "   Establece la variable DB_PASSWORD o asegúrate de que .env.local tenga DATABASE_URL"
  exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

echo "Conectando a PostgreSQL en $DB_HOST:$DB_PORT..."
echo "Base de datos: $DB_NAME"
echo ""

# Lista de migraciones del módulo educativo
migrations=(
  "110_educacion_estudiantes.sql"
  "111_educacion_apoderados.sql"
  "112_educacion_cursos.sql"
  "113_educacion_asignaturas.sql"
  "114_educacion_asistencia.sql"
  "115_educacion_calificaciones.sql"
  "116_educacion_comunicados.sql"
  "117_educacion_pensiones.sql"
  "118_educacion_eventos.sql"
  "119_educacion_biblioteca.sql"
  "120_educacion_admision.sql"
  "121_educacion_transporte.sql"
  "122_educacion_subvenciones.sql"
)

# Ejecutar cada migración
for migration in "${migrations[@]}"; do
  file_path="packages/db/supabase/migrations/$migration"
  
  if [ ! -f "$file_path" ]; then
    echo "⚠️  Archivo no encontrado: $migration"
    continue
  fi
  
  echo "Ejecutando: $migration"
  
  if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file_path" 2>&1 | grep -q "ERROR"; then
    echo "  ⚠️  Posible error o ya existe (revisar manualmente)"
  else
    echo "  ✅ Completada"
  fi
done

echo ""
echo "=== Migraciones del Módulo Educativo Completadas ==="
echo ""
echo "Para verificar que las tablas fueron creadas, ejecuta:"
echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c \"\\dt educacion_*\""

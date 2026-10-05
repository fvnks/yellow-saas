#!/bin/bash
# ============================================
# Script de Alertas Automáticas - Cron Job
# ============================================
# Este script debe ser ejecutado diariamente por cron
# Ejemplo de configuración en crontab:
# 0 8 * * * /ruta/al/proyecto/scripts/alertas-automaticas-cron.sh
# (Ejecuta todos los días a las 8:00 AM)

# Cambiar al directorio del proyecto
cd "$(dirname "$0")/.."

# Archivo de log
LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/alertas-automaticas-$(date +%Y-%m-%d).log"

# Crear directorio de logs si no existe
mkdir -p "$LOG_DIR"

# Función para loguear
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "Iniciando proceso de alertas automáticas"
log "=========================================="

# Ejecutar script de alertas
node scripts/alertas-automaticas.js 2>&1 | tee -a "$LOG_FILE"

log "=========================================="
log "Proceso de alertas completado"
log "=========================================="

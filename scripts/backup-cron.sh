#!/usr/bin/env bash
# Yellow ERP - scheduled DB backup for the VPS (Coolify)
#
# Run via crontab (as root or a user with docker access):
#  0 3 * * * /opt/yellow-erp/backup-cron.sh >> /var/log/yellow-backup.log 2>&1
#
# Config (adjust for your setup):
DB_HOST="${DB_HOST:-localhost}"          # Postgres host (localhost if same VPS)
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"           # set via env or DB_PASSWORD_FILE
BACKUP_DIR="${BACKUP_DIR:-/opt/yellow-erp/backups}"
KEEP="${KEEP:-14}"                       # how many backups to keep

if [ -f "$DB_PASSWORD_FILE" ]; then
  DB_PASSWORD="$(cat "$DB_PASSWORD_FILE")"
fi

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/yellow-erp-$STAMP.sql"

export PGPASSWORD="$DB_PASSWORD"

# Prefer pg_dump from the host; fall back to docker exec into the postgres container.
if command -v pg_dump >/dev/null 2>&1; then
  pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-privileges -f "$OUT"
else
  CONTAINER="$(docker ps --format '{{.Names}}' | grep -i postgres | head -n1)"
  if [ -z "$CONTAINER" ]; then
    echo "ERROR: no pg_dump and no postgres container found" >&2
    exit 1
  fi
  docker exec -e PGPASSWORD="$DB_PASSWORD" "$CONTAINER" pg_dump \
    -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-privileges > "$OUT"
fi

if [ -s "$OUT" ]; then
  echo "OK: $(date) - $(du -h "$OUT" | cut -f1) -> $OUT"
else
  echo "FAIL: $(date) - backup file is empty" >&2
  rm -f "$OUT"
  exit 1
fi

# Rotate old backups
ls -1t "$BACKUP_DIR"/yellow-erp-*.sql 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f

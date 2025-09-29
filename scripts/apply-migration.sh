#!/usr/bin/env bash
set -euo pipefail

SQL_FILE="$(dirname "$0")/../db/migrations/2025-09-28-init.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "Migration file not found: $SQL_FILE"
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ] && [ -z "${SUPABASE_DB_URL:-}" ]; then
  cat <<EOF
Usage: set DATABASE_URL or SUPABASE_DB_URL to your Postgres connection string and run this script.

Examples:
  export DATABASE_URL="postgres://postgres:password@db.host:5432/postgres"
  bash scripts/apply-migration.sh

If you prefer, paste the SQL into the Supabase SQL editor (Dashboard → SQL) and run it there.
EOF
  exit 1
fi

URL="${DATABASE_URL:-${SUPABASE_DB_URL:-}}"

echo "Applying migration: $SQL_FILE"
echo "Using DATABASE_URL=${URL%:*}*** (hidden)"

# Run via psql. psql must be installed and NETWORK access to the DB must be allowed.
psql "$URL" -f "$SQL_FILE"

echo "Migration applied (if psql succeeded)."

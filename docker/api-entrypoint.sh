#!/bin/sh
set -e

# Parse DB_HOST from DATABASE_URL if not explicitly set
if [ -n "$DATABASE_URL" ] && [ -z "$DB_HOST" ]; then
  DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
  DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*@.*:([0-9]+)/.*|\1|')
fi

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"

echo "⏳ Waiting for PostgreSQL database to be reachable at ${DB_HOST}:${DB_PORT}..."
until nc -z -v -w5 "${DB_HOST}" "${DB_PORT}" 2>/dev/null || pg_isready -h "${DB_HOST}" -p "${DB_PORT}" 2>/dev/null; do
  echo "  Waiting 2s for database at ${DB_HOST}:${DB_PORT}..."
  sleep 2
done

echo "✅ PostgreSQL is ready and reachable at ${DB_HOST}:${DB_PORT}!"

echo "🔄 Deploying Prisma schema if needed..."
npx prisma migrate deploy 2>/dev/null || echo "Prisma schema up to date."

echo "🚀 Starting MOBEX API Server on port ${PORT:-3000}..."
exec node server.js

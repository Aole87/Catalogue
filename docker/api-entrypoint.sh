#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL database to be fully available..."
until nc -z -v -w30 "${DB_HOST:-postgres}" "${DB_PORT:-5432}" 2>/dev/null || pg_isready -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" 2>/dev/null; do
  echo "  Waiting 2s for database at ${DB_HOST:-postgres}:${DB_PORT:-5432}..."
  sleep 2
done

echo "✅ PostgreSQL is ready and reachable!"

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Ensuring database is in clean production state..."
npm run db:production-reset

echo "🚀 Starting MOBEX API Server on port 3000..."
exec npx tsx apps/api/src/server.ts

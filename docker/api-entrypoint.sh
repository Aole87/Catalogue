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

# Check if database is empty or if forced reset is requested
if [ "$INITIALIZE_DB" = "true" ]; then
  echo "🌱 Forced reset requested (INITIALIZE_DB=true)..."
  npm run db:production-reset
else
  echo "🔍 Checking database initialization status..."
  npx tsx -e "
    import { PrismaClient } from '@prisma/client';
    const p = new PrismaClient();
    async function check() {
      const count = await p.product.count();
      if (count === 0) {
        process.exit(10);
      }
      console.log('  ✓ Database already initialized (' + count + ' products found). Preserving live data.');
    }
    check().catch(() => process.exit(10)).finally(() => p.\$disconnect());
  " 2>/dev/null || {
    echo "🌱 Database empty, performing clean production setup and seeding..."
    npm run db:production-reset
  }
fi

echo "🚀 Starting MOBEX API Server on port 3000..."
exec npx tsx apps/api/src/server.ts

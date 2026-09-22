#!/usr/bin/env bash
# ==============================================================================
# MOBEX Automotive Parts - Database Setup Script
# Automatically creates and initializes PostgreSQL database with clean production data.
# ==============================================================================

set -e

# Default Database Settings (override with environment variables if needed)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-car_parts_catalog}"
SQL_DUMP_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/database_production.sql"

echo "================================================================="
echo " 🚗 MOBEX Production PostgreSQL Database Setup"
echo "================================================================="
echo "Target Host:     ${DB_HOST}:${DB_PORT}"
echo "Target Database: ${DB_NAME}"
echo "Target User:     ${DB_USER}"
echo "SQL Source:      ${SQL_DUMP_FILE}"
echo "-----------------------------------------------------------------"

# 1. Check if database exists, create if not
echo "📦 Step 1: Checking and creating database '${DB_NAME}'..."
if command -v createdb &> /dev/null; then
  createdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${DB_NAME}" 2>/dev/null || echo "Database '${DB_NAME}' already exists or created."
else
  psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 || \
  psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME};"
fi

# 2. Import complete database schema and production seed data
echo "📥 Step 2: Importing schema and official production catalog data..."
if [ -f "${SQL_DUMP_FILE}" ]; then
  psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "${SQL_DUMP_FILE}" > /dev/null
  echo "✅ SQL dump successfully restored into '${DB_NAME}'."
else
  echo "⚠️ SQL dump file not found at ${SQL_DUMP_FILE}. Running Prisma migrations..."
  npx prisma migrate deploy
  npx tsx prisma/seed.ts
fi

# 3. Generate Prisma Client
echo "⚙️ Step 3: Generating Prisma Client for backend API..."
npx prisma generate

# 4. Verify Database Records
echo "-----------------------------------------------------------------"
echo "🔍 Step 4: Verification of Database Records:"
psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "
  SELECT 
    (SELECT count(*) FROM users) AS \"Users (Admin & Staff)\",
    (SELECT count(*) FROM categories) AS \"Categories\",
    (SELECT count(*) FROM brands) AS \"Brands\",
    (SELECT count(*) FROM products) AS \"Products (SKU)\",
    (SELECT count(*) FROM orders) AS \"Orders (Clean 0)\";
"

echo "================================================================="
echo "🎉 PostgreSQL Database setup completed successfully!"
echo "You can now run the API server:"
echo "  node server.js"
echo "or with Docker:"
echo "  docker compose up -d"
echo "================================================================="

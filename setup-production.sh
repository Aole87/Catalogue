#!/usr/bin/env bash
# ==============================================================================
# MOBEX Production Server Deployment Script
# One-click script to set up PostgreSQL database and launch the API server.
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "================================================================="
echo " 🚀 MOBEX Automotive Platform — Production Setup"
echo "================================================================="

# Check if Docker is installed and running
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
  echo "🐳 Docker detected. You can run the entire stack with Docker:"
  echo "   docker compose up -d --build"
  echo ""
fi

# 1. Setup Database
echo "Step 1: Setting up PostgreSQL database..."
if [ -f "./setup-database.sh" ]; then
  ./setup-database.sh
fi

# 2. Build Frontend
echo "Step 2: Building Frontend assets..."
npm run build

# 3. Check for PM2 or direct Node execution
echo "Step 3: Starting Backend API on port 3000..."
if command -v pm2 &> /dev/null; then
  pm2 delete car-parts-api 2>/dev/null || true
  pm2 start server.js --name "car-parts-api"
  pm2 save
  echo "✅ API Server is running under PM2 on port 3000!"
  pm2 status
else
  echo "💡 PM2 not found. You can start the server in background with:"
  echo "   nohup node server.js > api.log 2>&1 &"
  echo "Or in foreground with:"
  echo "   node server.js"
fi

echo "================================================================="
echo "🎉 Deployment setup completed!"
echo "Storefront: https://market.autocentric.net/"
echo "Admin:      https://market.autocentric.net/admin"
echo "================================================================="

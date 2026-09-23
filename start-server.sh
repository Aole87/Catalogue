#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "================================================="
echo " 🚗 Starting MOBEX Fastify API Server on Port 3000"
echo "================================================="

# Pull latest pre-compiled bundle from GitHub
git pull origin main

# Start API Server using PM2 or nohup
if command -v pm2 &> /dev/null; then
  pm2 delete car-parts-api 2>/dev/null || true
  pm2 start server.js --name "car-parts-api"
  pm2 save
  echo "✅ API Server running with PM2 on port 3000!"
  pm2 status
else
  fuser -k 3000/tcp 2>/dev/null || true
  nohup node server.js > api.log 2>&1 &
  sleep 2
  echo "✅ API Server started in background (PID: $(pgrep -f 'server.js' | tail -n 1 || echo 'active'))"
fi

echo "-------------------------------------------------"
echo "🔍 Health Check:"
sleep 1
curl -s http://127.0.0.1:3000/health || echo "API is starting..."
echo ""
echo "================================================="

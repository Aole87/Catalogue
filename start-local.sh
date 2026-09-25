#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "=========================================================="
echo " 🚗 MOBEX Automotive Catalog - Local Development Launcher"
echo "=========================================================="

# 1. Check network connectivity to Server Docker PostgreSQL
echo "🔍 Checking remote database at 147.50.230.75:5432..."
if nc -z -v -w4 147.50.230.75 5432 2>/dev/null; then
  echo "✅ Remote Docker PostgreSQL is online and reachable!"
else
  echo "⚠️ Warning: Cannot connect to 147.50.230.75:5432. Please check your internet connection."
fi

# 2. Cleanup any old processes holding ports
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :5173 | xargs kill -9 2>/dev/null || true

# 3. Trap exit signals to gracefully shut down background API server
cleanup() {
  echo ""
  echo "🛑 Stopping Local Development Servers..."
  if [ -n "$API_PID" ]; then
    kill "$API_PID" 2>/dev/null || true
  fi
  lsof -ti :3000 | xargs kill -9 2>/dev/null || true
  lsof -ti :5173 | xargs kill -9 2>/dev/null || true
  echo "✅ All local services stopped cleanly."
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 4. Start API Server in background
echo "🚀 Starting Backend API on http://localhost:3000..."
node server.js > .local-api.log 2>&1 &
API_PID=$!
sleep 2

if kill -0 "$API_PID" 2>/dev/null; then
  echo "✅ Backend API running (PID: $API_PID) -> connected to Server Docker DB"
else
  echo "❌ Failed to start Backend API. Check .local-api.log:"
  cat .local-api.log
  exit 1
fi

# 5. Start Vite Frontend (foreground)
echo "🌐 Starting Frontend Web on http://localhost:5173..."
echo "👉 Press Ctrl+C at any time to stop both Frontend & Backend."
echo "=========================================================="
npx vite --port 5173 --host 0.0.0.0

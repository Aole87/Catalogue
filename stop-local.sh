#!/usr/bin/env bash
echo "🛑 Stopping any running local development servers..."
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :5173 | xargs kill -9 2>/dev/null || true
echo "✅ Ports 3000 (API) and 5173 (Vite) are now completely free."

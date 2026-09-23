#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "================================================="
echo " 🐳 Launching MOBEX API Container on Port 3000"
echo "================================================="

# Stop and remove existing container if any
docker rm -f car_parts_api 2>/dev/null || true

# Build API Docker image
echo "🔨 Building car-parts-api Docker image..."
docker build -t car-parts-api:latest -f Dockerfile.api .

# Run Docker container using host network mode
# This allows the container to:
# - Connect directly to PostgreSQL on 127.0.0.1:5432
# - Listen directly on 127.0.0.1:3000 for Apache reverse proxy
echo "🚀 Starting car_parts_api container..."
docker run -d \
  --name car_parts_api \
  --restart unless-stopped \
  --network host \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e HOST=0.0.0.0 \
  -e DATABASE_URL="${DATABASE_URL:-postgresql://autoparts_user:autoparts_secure_pass123@127.0.0.1:5432/car_parts_catalog?schema=public}" \
  -e CORS_ALLOWED_ORIGINS="https://market.autocentric.net,http://market.autocentric.net,http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173" \
  car-parts-api:latest

echo "-------------------------------------------------"
echo "⏳ Waiting for container to initialize..."
sleep 4

docker ps --filter "name=car_parts_api"
echo ""
echo "🔍 Health Check:"
curl -s http://127.0.0.1:3000/health || docker logs --tail 20 car_parts_api
echo ""
echo "================================================="

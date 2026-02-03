#!/usr/bin/env bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🐳 Starting Docker QA..."

# 1. Build and Start
echo "🚀 Building and starting containers..."
docker compose up -d --build

# 2. Wait for Readiness
echo "⏳ Waiting for API readiness..."
MAX_RETRIES=30
COUNT=0
URL="http://localhost:3000/api/v1/health/ready"

until curl -s "$URL" | grep "ok" > /dev/null; do
  COUNT=$((COUNT+1))
  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo -e "${RED}❌ Timeout waiting for $URL${NC}"
    docker compose logs --tail=50
    exit 1
  fi
  echo "   ...waiting ($COUNT/$MAX_RETRIES)"
  sleep 2
done

echo -e "${GREEN}✅ API is ready!${NC}"

# 3. Print Info
echo ""
echo "---------------------------------------------------"
echo -e "${GREEN}✅ Docker QA Passed${NC}"
echo "---------------------------------------------------"
echo "Swagger:  http://localhost:3000/docs"
echo "Health:   http://localhost:3000/api/v1/health"
echo "Ready:    http://localhost:3000/api/v1/health/ready"
echo "---------------------------------------------------"

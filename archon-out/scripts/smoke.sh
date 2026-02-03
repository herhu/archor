#!/usr/bin/env bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔥 Starting Smoke Test..."

# 1. Get Token
echo "🔑 Getting Auth Token..."
TOKEN=$(./scripts/get-token.sh)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to get token${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Token acquired${NC}"

# 2. Check Health
echo "💓 Checking Health..."
STATUS=$(curl -s http://localhost:3000/api/v1/health/ready | grep "ok" || true)

if [ -z "$STATUS" ]; then
  echo -e "${RED}❌ Health check failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Health check passed${NC}"

# 3. Check Protected Endpoint (List Notifications - requires patient:read)
echo "🛡️ Checking Protected Endpoint (List Notifications)..."
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/notifications)

# Simple check if response is JSON array or expected error (if empty DB)
# For now, just checking it didn't return 401/403
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/notifications)

if [ "$HTTP_CODE" == "200" ]; then
   echo -e "${GREEN}✅ Protected endpoint accessible (200 OK)${NC}"
else
   echo -e "${RED}❌ Protected endpoint failed ($HTTP_CODE)${NC}"
   echo "Response: $RESPONSE"
   exit 1
fi

echo ""
echo "---------------------------------------------------"
echo -e "${GREEN}✅ Smoke Test Passed${NC}"
echo "---------------------------------------------------"

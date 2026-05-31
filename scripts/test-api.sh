#!/bin/bash
# test-api.sh - Test the Verify API endpoints
# Usage: ./scripts/test-api.sh [BACKEND_URL] [API_KEY]

set -e

# Get backend URL and API key from arguments or environment
BACKEND_URL=${1:-${NEXT_PUBLIC_API_URL:-http://localhost:8000}}
API_KEY=${2:-verify_test_key}

echo "=========================================="
echo "Verify API - Test Script"
echo "=========================================="
echo "Backend URL: $BACKEND_URL"
echo "API Key: $API_KEY"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function for curl with error handling
test_endpoint() {
    local name=$1
    local expected_status=$2
    shift 2
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$@" 2>&1)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $http_code)"
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code, expected $expected_status)"
        echo "Response: $body"
        return 1
    fi
}

echo "----------------------------------------"
echo "1. Health Check"
echo "----------------------------------------"
test_endpoint "Health endpoint" "200" \
    "$BACKEND_URL/v1/health"

echo ""
echo "----------------------------------------"
echo "2. API Key Management"
echo "----------------------------------------"

# Create a new API key
echo -n "Creating API key... "
CREATE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/v1/keys" \
    -H "Content-Type: application/json" \
    -d '{"name": "Test Key", "tier": "starter"}' 2>&1)
CREATE_HTTP=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/v1/keys" \
    -H "Content-Type: application/json" \
    -d '{"name": "Test Key", "tier": "starter"}' | tail -n1)

if [ "$CREATE_HTTP" = "201" ] || [ "$CREATE_HTTP" = "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
    # Extract the API key from response
    if command -v python3 &> /dev/null; then
        API_KEY=$(echo "$CREATE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['key'])" 2>/dev/null || echo "verify_test_key")
    fi
    echo "Created API key: ${API_KEY:0:20}..."
else
    echo -e "${YELLOW}⚠ Could not create key (may already exist)${NC}"
    echo "Response: $CREATE_RESPONSE"
fi

echo ""
echo "----------------------------------------"
echo "3. Text Verification"
echo "----------------------------------------"

# Test AI-generated text (should have high AI probability)
echo "Testing AI-generated text..."
AI_TEXT="This is a test message that we are using to verify the functionality of the text analysis system. The quick brown fox jumps over the lazy dog. Machine learning algorithms are becoming increasingly sophisticated at detecting patterns in text data."

RESPONSE=$(curl -s -X POST "$BACKEND_URL/v1/verify/text" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d "{\"text\": \"$AI_TEXT\", \"return_signals\": true}")

AI_PROB=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['ai_probability'])" 2>/dev/null || echo "unknown")

echo "AI Probability: $AI_PROB"

if command -v python3 &> /dev/null; then
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo "$RESPONSE"
fi

echo ""
echo "----------------------------------------"
echo "4. Batch Verification"
echo "----------------------------------------"

echo -n "Testing batch endpoint... "
BATCH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/v1/verify/batch" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d '{"texts": ["First test text", "Second test text"], "return_signals": false}')
BATCH_HTTP=$(echo "$BATCH_RESPONSE" | tail -n1)

if [ "$BATCH_HTTP" = "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ HTTP $BATCH_HTTP${NC}"
fi

echo ""
echo "----------------------------------------"
echo "5. Usage Statistics"
echo "----------------------------------------"

echo -n "Testing usage endpoint... "
USAGE_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/v1/usage" \
    -H "X-API-Key: $API_KEY")
USAGE_HTTP=$(echo "$USAGE_RESPONSE" | tail -n1)

if [ "$USAGE_HTTP" = "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ HTTP $USAGE_HTTP${NC}"
fi

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo "If all tests passed, your API is working correctly."
echo ""
echo "Next steps:"
echo "1. Open the frontend dashboard"
echo "2. Create an API key in the dashboard"
echo "3. Test the verification UI"
echo ""
echo "For more details, see LAUNCH.md"
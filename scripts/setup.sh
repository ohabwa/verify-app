#!/bin/bash
# setup.sh - Prepare environment for local development
# This script helps generate a .env file from the template

set -e

echo "=========================================="
echo "Verify API - Local Setup Script"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "backend/.env.example" ]; then
    echo "Error: Run this script from the verify-app directory"
    echo "  cd /home/team/shared/verify-app"
    echo "  ./scripts/setup.sh"
    exit 1
fi

# Generate a random secret key
SECRET_KEY=$(openssl rand -hex 32)
echo "Generated SECRET_KEY: $SECRET_KEY"
echo ""

# Ask for DATABASE_URL
echo "Enter your DATABASE_URL (PostgreSQL connection string):"
echo "Example: postgresql://postgres:password@localhost:5432/verify"
read -p "DATABASE_URL: " DATABASE_URL

# Ask for REDIS_URL
echo ""
echo "Enter your REDIS_URL (Redis connection string):"
echo "Example: redis://localhost:6379/0"
read -p "REDIS_URL: " REDIS_URL

# Create backend/.env
echo ""
echo "Creating backend/.env..."
cat > backend/.env << EOF
# Verify API Configuration
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL}
SECRET_KEY=${SECRET_KEY}
API_KEY_HEADER=X-API-Key
APP_NAME=Verify API
APP_VERSION=0.1.0
CORS_ORIGINS=*
EOF

echo "✅ Created backend/.env"
echo ""

# Ask for NEXT_PUBLIC_API_URL
echo "Enter your backend API URL (for frontend):"
echo "Example: http://localhost:8000 or https://your-api.railway.app"
read -p "NEXT_PUBLIC_API_URL: " NEXT_PUBLIC_API_URL

# Create frontend/.env.local
echo ""
echo "Creating frontend/.env.local..."
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
EOF

echo "✅ Created frontend/.env.local"
echo ""

# Summary
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start the backend: cd backend && uvicorn app.main:app --reload"
echo "2. Start the frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker Compose:"
echo "  docker-compose up -d"
echo ""
echo "Your environment files:"
echo "  - backend/.env (contains DATABASE_URL, REDIS_URL, SECRET_KEY)"
echo "  - frontend/.env.local (contains NEXT_PUBLIC_API_URL)"
echo ""
echo "⚠️  IMPORTANT: Never commit .env files to Git!"
echo "   They are already in .gitignore"
#!/bin/bash

# Deployment Script for Civic Issue Monitoring System
# Usage: ./deploy.sh [environment]
# environment: development, staging, production

set -e

ENVIRONMENT="${1:-production}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "================================"
echo "Deploying Civic Issue Monitoring System"
echo "Environment: $ENVIRONMENT"
echo "================================"

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    export $(cat ".env.$ENVIRONMENT" | xargs)
fi

# Step 1: Pull latest code
echo "Step 1: Pulling latest code..."
git pull origin main

# Step 2: Install/update dependencies
echo "Step 2: Installing dependencies..."

# Backend
cd "$PROJECT_DIR/backend"
npm ci --only=production

# Frontend
cd "$PROJECT_DIR/frontend"
npm ci
npm run build

# AI Service
cd "$PROJECT_DIR/ai-service"
pip install -r requirements.txt

# Step 3: Database migrations
echo "Step 3: Running database migrations..."
cd "$PROJECT_DIR/database"
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f schema.sql || true

# Step 4: Restart services
echo "Step 4: Restarting services..."
cd "$PROJECT_DIR"

if [ "$ENVIRONMENT" == "production" ]; then
    docker-compose down
    docker-compose up -d --build
else
    # For development/staging, restart using PM2 or similar
    pm2 restart civic-backend || pm2 start backend/src/server.js --name civic-backend
    pm2 restart civic-ai || pm2 start ai-service/app.py --name civic-ai --interpreter python3
fi

# Step 5: Health check
echo "Step 5: Running health checks..."
sleep 10

BACKEND_HEALTH=$(curl -s http://localhost:3000/health | jq -r '.status')
AI_HEALTH=$(curl -s http://localhost:5000/health | jq -r '.status')

if [ "$BACKEND_HEALTH" == "ok" ] && [ "$AI_HEALTH" == "ok" ]; then
    echo "✓ All services are healthy!"
else
    echo "✗ Some services failed health check!"
    echo "Backend: $BACKEND_HEALTH"
    echo "AI Service: $AI_HEALTH"
    exit 1
fi

# Step 6: Cleanup
echo "Step 6: Cleaning up..."
docker system prune -f

echo "================================"
echo "Deployment completed successfully!"
echo "================================"

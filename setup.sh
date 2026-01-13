#!/bin/bash

# AI-Based Civic Issue Monitoring System - Setup Script
# This script sets up the development environment

set -e

echo "======================================"
echo "Civic Issue Monitoring System Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"

if ! command_exists python3; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    echo "Please install Python 3 from https://python.org/"
    exit 1
fi
echo -e "${GREEN}✓ Python found: $(python3 --version)${NC}"

if ! command_exists psql; then
    echo -e "${YELLOW}Warning: PostgreSQL client not found${NC}"
    echo "You'll need to install PostgreSQL manually"
fi

echo ""
echo "======================================"
echo "Setting up Backend..."
echo "======================================"

cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created backend .env file${NC}"
    echo -e "${YELLOW}Please edit backend/.env with your configuration${NC}"
else
    echo -e "${YELLOW}backend/.env already exists, skipping${NC}"
fi

echo "Installing backend dependencies..."
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

mkdir -p uploads logs
echo -e "${GREEN}✓ Created uploads and logs directories${NC}"

cd ..

echo ""
echo "======================================"
echo "Setting up AI Service..."
echo "======================================"

cd ai-service
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created AI service .env file${NC}"
else
    echo -e "${YELLOW}ai-service/.env already exists, skipping${NC}"
fi

echo "Creating Python virtual environment..."
python3 -m venv venv
echo -e "${GREEN}✓ Virtual environment created${NC}"

echo "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
echo -e "${GREEN}✓ Python dependencies installed${NC}"

cd ..

echo ""
echo "======================================"
echo "Setting up Frontend..."
echo "======================================"

cd frontend
echo "Installing frontend dependencies..."
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

cd ..

echo ""
echo "======================================"
echo "Setting up Mobile App..."
echo "======================================"

cd mobile-app
echo "Installing mobile app dependencies..."
npm install
echo -e "${GREEN}✓ Mobile app dependencies installed${NC}"
echo -e "${YELLOW}Don't forget to update API_URL in src/context/AuthContext.js${NC}"

cd ..

echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Setup PostgreSQL database:"
echo "   psql -U postgres -f database/schema.sql"
echo "   psql -U postgres -f database/seed_data.sql"
echo ""
echo "2. Configure environment variables:"
echo "   - Edit backend/.env"
echo "   - Edit ai-service/.env"
echo ""
echo "3. Start the services:"
echo ""
echo "   Terminal 1 - Backend:"
echo "   cd backend && npm run dev"
echo ""
echo "   Terminal 2 - AI Service:"
echo "   cd ai-service && source venv/bin/activate && python app.py"
echo ""
echo "   Terminal 3 - Frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "   Terminal 4 - Mobile App:"
echo "   cd mobile-app && npx expo start"
echo ""
echo "Or use Docker Compose:"
echo "   docker-compose up -d"
echo ""
echo -e "${GREEN}Happy coding!${NC}"

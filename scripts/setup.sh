#!/bin/bash

# Setup Script for Civic Issue Monitoring System
# This script automates the initial setup of the entire system

set -e

echo "================================"
echo "Civic Issue Monitoring System"
echo "Automated Setup Script"
echo "================================"
echo ""

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "✗ Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    echo "✓ Node.js $(node --version)"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo "✗ Python is not installed. Please install Python 3.8+ first."
        exit 1
    fi
    echo "✓ Python $(python3 --version)"
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        echo "✗ PostgreSQL is not installed. Please install PostgreSQL 12+ with PostGIS."
        exit 1
    fi
    echo "✓ PostgreSQL $(psql --version)"
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        echo "✓ Docker $(docker --version)"
    else
        echo "⚠ Docker not found (optional)"
    fi
    
    echo ""
}

# Setup environment files
setup_environment() {
    echo "Setting up environment variables..."
    
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    DB_PASSWORD=$(openssl rand -base64 16)
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        sed -i "s/your_password_here/$DB_PASSWORD/g" backend/.env
        sed -i "s/your_super_secret_jwt_key_change_this_in_production/$JWT_SECRET/g" backend/.env
        echo "✓ Backend .env created"
    else
        echo "⚠ Backend .env already exists, skipping"
    fi
    
    # AI Service .env
    if [ ! -f "ai-service/.env" ]; then
        cp ai-service/.env.example ai-service/.env
        echo "✓ AI Service .env created"
    else
        echo "⚠ AI Service .env already exists, skipping"
    fi
    
    echo ""
}

# Setup database
setup_database() {
    echo "Setting up database..."
    
    read -p "Enter PostgreSQL username [postgres]: " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    read -sp "Enter PostgreSQL password: " DB_PASS
    echo ""
    
    export PGPASSWORD=$DB_PASS
    
    # Create database
    echo "Creating database..."
    psql -U $DB_USER -h localhost -c "CREATE DATABASE civic_issues;" 2>/dev/null || echo "Database already exists"
    
    # Enable PostGIS
    psql -U $DB_USER -h localhost -d civic_issues -c "CREATE EXTENSION IF NOT EXISTS postgis;"
    
    # Run schema
    echo "Creating database schema..."
    psql -U $DB_USER -h localhost -d civic_issues -f database/schema.sql
    
    # Run seed data
    echo "Inserting seed data..."
    psql -U $DB_USER -h localhost -d civic_issues -f database/seed_data.sql
    
    echo "✓ Database setup completed"
    echo ""
}

# Install dependencies
install_dependencies() {
    echo "Installing dependencies..."
    
    # Backend
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo "✓ Backend dependencies installed"
    
    # Frontend
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✓ Frontend dependencies installed"
    
    # Mobile App
    echo "Installing mobile app dependencies..."
    cd mobile-app
    npm install
    cd ..
    echo "✓ Mobile app dependencies installed"
    
    # AI Service
    echo "Installing AI service dependencies..."
    cd ai-service
    python3 -m venv venv
    source venv/bin/activate || . venv/Scripts/activate
    pip install -r requirements.txt
    deactivate
    cd ..
    echo "✓ AI service dependencies installed"
    
    echo ""
}

# Create necessary directories
create_directories() {
    echo "Creating necessary directories..."
    
    mkdir -p backend/uploads
    mkdir -p backend/logs
    mkdir -p ai-service/models
    mkdir -p backups
    
    echo "✓ Directories created"
    echo ""
}

# Setup complete message
setup_complete() {
    echo "================================"
    echo "Setup completed successfully!"
    echo "================================"
    echo ""
    echo "Next steps:"
    echo "1. Start the backend server:"
    echo "   cd backend && npm run dev"
    echo ""
    echo "2. Start the AI service:"
    echo "   cd ai-service && source venv/bin/activate && python app.py"
    echo ""
    echo "3. Start the frontend:"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "4. Start the mobile app:"
    echo "   cd mobile-app && npx expo start"
    echo ""
    echo "Or use Docker:"
    echo "   docker-compose up -d"
    echo ""
    echo "Access the application:"
    echo "- Frontend: http://localhost:3001"
    echo "- Backend API: http://localhost:3000"
    echo "- API Documentation: http://localhost:3000/api-docs"
    echo "- AI Service: http://localhost:5000"
    echo ""
    echo "Default credentials will be in the database seed data."
    echo "================================"
}

# Main execution
main() {
    check_prerequisites
    setup_environment
    create_directories
    install_dependencies
    
    read -p "Do you want to setup the database now? (yes/no): " SETUP_DB
    if [ "$SETUP_DB" == "yes" ]; then
        setup_database
    fi
    
    setup_complete
}

# Run main function
main

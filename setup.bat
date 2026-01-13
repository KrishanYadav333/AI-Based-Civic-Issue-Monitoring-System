@echo off
REM AI-Based Civic Issue Monitoring System - Windows Setup Script
REM This script sets up the development environment on Windows

echo ======================================
echo Civic Issue Monitoring System Setup
echo ======================================
echo.

echo Checking prerequisites...

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)
echo [OK] Node.js found
node --version

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed
    exit /b 1
)
echo [OK] npm found
npm --version

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed
    echo Please install Python from https://python.org/
    exit /b 1
)
echo [OK] Python found
python --version

echo.
echo ======================================
echo Setting up Backend...
echo ======================================

cd backend
if not exist .env (
    copy .env.example .env
    echo [OK] Created backend .env file
    echo [WARN] Please edit backend\.env with your configuration
) else (
    echo [WARN] backend\.env already exists, skipping
)

echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing backend dependencies
    exit /b 1
)
echo [OK] Backend dependencies installed

if not exist uploads mkdir uploads
if not exist logs mkdir logs
echo [OK] Created uploads and logs directories

cd ..

echo.
echo ======================================
echo Setting up AI Service...
echo ======================================

cd ai-service
if not exist .env (
    copy .env.example .env
    echo [OK] Created AI service .env file
) else (
    echo [WARN] ai-service\.env already exists, skipping
)

echo Creating Python virtual environment...
python -m venv venv
echo [OK] Virtual environment created

echo Installing Python dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Error installing Python dependencies
    exit /b 1
)
call venv\Scripts\deactivate.bat
echo [OK] Python dependencies installed

cd ..

echo.
echo ======================================
echo Setting up Frontend...
echo ======================================

cd frontend
echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing frontend dependencies
    exit /b 1
)
echo [OK] Frontend dependencies installed

cd ..

echo.
echo ======================================
echo Setting up Mobile App...
echo ======================================

cd mobile-app
echo Installing mobile app dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing mobile app dependencies
    exit /b 1
)
echo [OK] Mobile app dependencies installed
echo [WARN] Don't forget to update API_URL in src\context\AuthContext.js

cd ..

echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo Next steps:
echo.
echo 1. Setup PostgreSQL database:
echo    psql -U postgres -f database\schema.sql
echo    psql -U postgres -f database\seed_data.sql
echo.
echo 2. Configure environment variables:
echo    - Edit backend\.env
echo    - Edit ai-service\.env
echo.
echo 3. Start the services:
echo.
echo    Terminal 1 - Backend:
echo    cd backend ^&^& npm run dev
echo.
echo    Terminal 2 - AI Service:
echo    cd ai-service ^&^& venv\Scripts\activate ^&^& python app.py
echo.
echo    Terminal 3 - Frontend:
echo    cd frontend ^&^& npm run dev
echo.
echo    Terminal 4 - Mobile App:
echo    cd mobile-app ^&^& npx expo start
echo.
echo Or use Docker Compose:
echo    docker-compose up -d
echo.
echo Happy coding!
echo.
pause

#!/bin/bash

# Start both AI Service and Robot Service in the same container

echo "🚀 Starting Combined AI + Robot Services..."

# Start AI Service (FastAPI) on port 5000 in background
echo "▶️  Starting AI Service (FastAPI) on port ${AI_PORT:-5000}..."
uvicorn src.main:app --host 0.0.0.0 --port ${AI_PORT:-5000} &
AI_PID=$!

# Wait a moment for AI service to initialize
sleep 3

# Start Robot Service (Flask) on port 5001 in background
echo "▶️  Starting Robot Service (Flask) on port ${ROBOT_PORT:-5001}..."
cd robot-service && python app.py &
ROBOT_PID=$!

# Wait for both services
echo "✅ Both services started!"
echo "   AI Service (YOLOv8): http://localhost:${AI_PORT:-5000}"
echo "   Robot Service (Roboflow): http://localhost:${ROBOT_PORT:-5001}"

# Keep container running and monitor both processes
wait $AI_PID $ROBOT_PID

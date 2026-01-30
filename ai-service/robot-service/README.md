# Robot Survey Service

**Port**: 5001 (Main AI service uses 5000)

## Purpose
Autonomous robot survey system using Roboflow API for multi-model detection (potholes, garbage, manholes, etc.)

## Run
```bash
cd robot-service
python app.py
```

## Endpoints
- `/` - Web interface
- `/robot` - Robot interface
- `/admin` - Admin dashboard
- `/detect` - Multi-model detection
- `/robot/submit` - Robot submission endpoint
- `/health` - Health check

## Database
SQLite database: `robot_survey.db` (created automatically)

## Integration with Main App
- Main AI service: `ai-service/` (port 5000) - Uses YOLOv8/Keras
- Robot service: `robot-service/` (port 5001) - Uses Roboflow API
- Backend calls main AI service for issue classification
- Robot service is independent for autonomous surveys

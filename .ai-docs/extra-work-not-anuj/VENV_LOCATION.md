# Virtual Environment Location

## Python Virtual Environment

The Python virtual environment for the AI service is located at:
```
D:\venvs\civic-issue-monitor
```

## Usage

### Activate the virtual environment:
```powershell
# PowerShell
D:\venvs\civic-issue-monitor\Scripts\Activate.ps1

# Command Prompt
D:\venvs\civic-issue-monitor\Scripts\activate.bat
```

### Deactivate:
```powershell
deactivate
```

## Benefits of Dedicated Location

1. **Separate from Project**: Virtual environment is not cluttered in the project directory
2. **Persistent**: Won't be accidentally deleted when cleaning project files
3. **Centralized**: All project virtual environments can be stored in `D:\venvs\`
4. **Git Clean**: No need to worry about accidentally committing venv files

## Setup

The virtual environment is automatically created when you run:
```powershell
.\scripts\setup.ps1
```

## Manual Setup

If needed, you can manually create the virtual environment:
```powershell
# Create D:\venvs directory
New-Item -ItemType Directory -Path D:\venvs -Force

# Create virtual environment
python -m venv D:\venvs\civic-issue-monitor

# Activate
D:\venvs\civic-issue-monitor\Scripts\Activate.ps1

# Install dependencies
cd ai-service
pip install -r requirements.txt
```

## Running AI Service

```powershell
cd ai-service
D:\venvs\civic-issue-monitor\Scripts\Activate.ps1
python app.py
```

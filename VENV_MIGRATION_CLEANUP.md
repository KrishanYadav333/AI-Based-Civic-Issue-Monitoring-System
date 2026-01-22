# Virtual Environment Migration - Cleanup Instructions

## ✅ Migration Complete

The Python virtual environment has been successfully moved from the project directory to:
```
D:\venvs\civic-issue-monitor
```

## Package Updates

During migration, the following package was upgraded:
- **matplotlib**: 3.8.2 → 3.9.4 (for numpy 2.x compatibility and pre-built wheels)

This ensures all packages install cleanly without requiring C++ Build Tools or GCC compilers.

## Old Virtual Environment Locations (Can be deleted)

### 1. Project Root .venv
- **Location**: `D:\Hackathon\AI civic issue monitor\.venv`
- **Size**: ~500 MB
- **Status**: No longer needed

### 2. AI Service venv
- **Location**: `D:\Hackathon\AI civic issue monitor\ai-service\venv`
- **Size**: ~500 MB
- **Status**: No longer needed

## Cleanup Commands

To remove the old virtual environments and free up disk space:

### PowerShell
```powershell
# Remove old .venv from project root
Remove-Item -Path "D:\Hackathon\AI civic issue monitor\.venv" -Recurse -Force

# Remove old venv from ai-service
Remove-Item -Path "D:\Hackathon\AI civic issue monitor\ai-service\venv" -Recurse -Force

Write-Host "✓ Old virtual environments removed" -ForegroundColor Green
```

### Command Prompt
```cmd
rd /s /q "D:\Hackathon\AI civic issue monitor\.venv"
rd /s /q "D:\Hackathon\AI civic issue monitor\ai-service\venv"
echo Cleanup complete
```

## Benefits of New Location

1. **Centralized**: All virtual environments in one place (`D:\venvs\`)
2. **Clean Project**: Project directory is cleaner
3. **Git Friendly**: No risk of accidentally committing venv files
4. **Persistent**: Won't be deleted when cleaning project files
5. **Disk Space**: Can easily manage and clean all virtual environments from one location

## New Usage

### Activate Virtual Environment
```powershell
# PowerShell
D:\venvs\civic-issue-monitor\Scripts\Activate.ps1

# Command Prompt
D:\venvs\civic-issue-monitor\Scripts\activate.bat
```

### Run AI Service
```powershell
cd "D:\Hackathon\AI civic issue monitor\ai-service"
D:\venvs\civic-issue-monitor\Scripts\Activate.ps1
python app.py
```

## Automated Setup

The setup script has been updated. To recreate everything:
```powershell
.\scripts\setup.ps1
```

This will automatically:
- Create `D:\venvs\` if it doesn't exist
- Create the virtual environment at `D:\venvs\civic-issue-monitor`
- Install all Python dependencies
- Set up backend, frontend, and mobile app dependencies

## Disk Space Savings

After cleanup, you'll free up approximately **~1 GB** of disk space by removing the duplicate virtual environments.

## Rollback (if needed)

If you need to go back to the old setup:
```powershell
cd "D:\Hackathon\AI civic issue monitor\ai-service"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

However, the new centralized approach is recommended for better organization.

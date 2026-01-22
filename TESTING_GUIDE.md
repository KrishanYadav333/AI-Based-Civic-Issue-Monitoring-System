# Testing Guide - AI Civic Issue Monitoring System

## ✅ Services Status

### Currently Running:
- ✅ **Backend API**: http://localhost:3000 (Running with health endpoint)
- ✅ **AI Service**: http://localhost:5000 (Running - Flask server)
- ⚠️ **Database**: Not connected (needs PostgreSQL setup)
- ❌ **Frontend**: Not started (can be started with `npm run dev`)
- ❌ **Mobile App**: Not started (can be started with `npx expo start`)

## 🚀 Quick Start Commands

### 1. Start Backend (Already Running)
```powershell
cd "D:\Hackathon\AI civic issue monitor\backend"
npm run dev
```
**Status**: ✅ Running on port 3000  
**Health Check**: http://localhost:3000/health

### 2. Start AI Service (Already Running)
```powershell
cd "D:\Hackathon\AI civic issue monitor\ai-service"
D:\venvs\civic-issue-monitor\Scripts\Activate.ps1
python app.py
```
**Status**: ✅ Running on port 5000  
**Health Check**: http://localhost:5000/health

### 3. Start Frontend
```powershell
cd "D:\Hackathon\AI civic issue monitor\frontend"
npm install   # If not already done
npm run dev
```
**Will run on**: http://localhost:3001

### 4. Start Mobile App
```powershell
cd "D:\Hackathon\AI civic issue monitor\mobile-app"
npm install   # If not already done
npx expo start
```
**Access via**: Expo Go app on your phone

### 5. Setup Database (Required for full functionality)
```powershell
# Make sure PostgreSQL is installed and running
cd "D:\Hackathon\AI civic issue monitor"

# Run setup script
.\scripts\setup.ps1

# Or manually:
psql -U postgres -c "CREATE DATABASE civic_issues;"
psql -U postgres -d civic_issues -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -U postgres -d civic_issues -f database\schema.sql
psql -U postgres -d civic_issues -f database\seed_data.sql
```

---

## 🧪 Testing Advanced Features

### 1. WebSocket Real-Time Updates

**Backend**: WebSocket server integrated in `backend/src/websocket.js`

**Test from Browser Console**:
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  console.log('Connected to WebSocket');
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your_jwt_token_here'
  }));
};

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};

// Subscribe to updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'issues'
}));
```

**Expected Broadcasts**:
- `issue:created` - When new issue is reported
- `issue:updated` - When issue status changes
- `issue:assigned` - When issue is assigned to engineer

---

### 2. Push Notifications (Firebase FCM)

**Setup Required**:
1. Add Firebase credentials to `.env`:
```env
FIREBASE_SERVER_KEY=your_firebase_server_key
```

**Test API Endpoint**:
```powershell
# Register device for notifications
Invoke-RestMethod -Uri http://localhost:3000/api/notifications/register -Method Post -Headers @{"Authorization"="Bearer YOUR_TOKEN"; "Content-Type"="application/json"} -Body '{"deviceToken":"fcm_token_from_mobile_app","platform":"android"}'

# Send test notification
Invoke-RestMethod -Uri http://localhost:3000/api/notifications/send -Method Post -Headers @{"Authorization"="Bearer YOUR_TOKEN"; "Content-Type"="application/json"} -Body '{"userId":1,"title":"Test Notification","body":"Testing push notifications"}'
```

**Notification Triggers**:
- New issue assigned to engineer
- Issue status changed
- Issue resolved

---

### 3. QR Code Feedback System

**API Endpoints**:

**Generate QR Code**:
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/feedback/generate-qr/1 -Method Get -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```
Returns QR code image as base64

**Submit Feedback** (Public - No Auth Required):
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/feedback/submit -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"issueId":1,"rating":4,"comment":"Fixed quickly!","reportedBy":"Citizen Name","contact":"9876543210"}'
```

**Get Issue Feedback**:
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/feedback/issue/1 -Method Get -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

---

### 4. Reports Export (PDF/Excel)

**Generate Issue Report (PDF)**:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/reports/issue/1?format=pdf" -Method Get -Headers @{"Authorization"="Bearer YOUR_TOKEN"} -OutFile "issue_report.pdf"
```

**Export Issues to Excel**:
```powershell
$body = @{
  filters = @{
    status = "pending"
    type = "pothole"
    dateFrom = "2026-01-01"
    dateTo = "2026-01-31"
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/reports/export/excel" -Method Post -Headers @{"Authorization"="Bearer YOUR_TOKEN"; "Content-Type"="application/json"} -Body $body -OutFile "issues_report.xlsx"
```

**Ward Performance Report (PDF)**:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/reports/ward-performance?format=pdf" -Method Get -Headers @{"Authorization"="Bearer YOUR_TOKEN"} -OutFile "ward_performance.pdf"
```

---

### 5. Advanced Geospatial Features

**Heatmap Data** (Issue density clustering):
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/geospatial/heatmap?status=pending" -Method Get -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```
Returns clustered issue coordinates with density

**Route Optimization** (Visit multiple issues efficiently):
```powershell
$body = @{
  issueIds = @(1, 2, 3, 4, 5)
  startLocation = @{
    latitude = 22.3072
    longitude = 73.1812
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/geospatial/route" -Method Post -Headers @{"Authorization"="Bearer YOUR_TOKEN"; "Content-Type"="application/json"} -Body $body
```

**Spatial Statistics**:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/geospatial/stats?wardId=1" -Method Get -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```
Returns:
- Issues per sq km
- Average distance to ward center
- Clustering patterns
- Hotspot identification

---

### 6. Caching (Redis)

**Setup**: Uncomment Redis configuration in `backend/src/utils/cacheService.js`

**Cached Endpoints** (Automatic):
- Dashboard statistics (TTL: 5 minutes)
- Ward list (TTL: 1 hour)
- Issue counts (TTL: 2 minutes)

**Manual Cache Control**:
```powershell
# Clear specific cache
Invoke-RestMethod -Uri "http://localhost:3000/api/cache/clear/dashboard_stats_admin" -Method Delete -Headers @{"Authorization"="Bearer YOUR_TOKEN"}

# Clear all cache
Invoke-RestMethod -Uri "http://localhost:3000/api/cache/clear-all" -Method Delete -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

---

### 7. ML Model Training

**Train Custom Model** (for your local issue images):

```powershell
cd "D:\Hackathon\AI civic issue monitor\ai-service"
& "D:/Hackathon/AI civic issue monitor/.venv/Scripts/python.exe" train_model.py
```

**Required Setup**:
1. Create `ai-service/dataset/` folder
2. Organize images:
```
dataset/
├── train/
│   ├── pothole/
│   ├── garbage/
│   ├── debris/
│   ├── stray_cattle/
│   ├── broken_road/
│   └── open_manhole/
└── validation/
    └── (same structure)
```
3. Minimum 100 images per category recommended

**Model Output**:
- Saved to `ai-service/models/issue_classifier_trained.h5`
- Training logs in `ai-service/logs/training.log`
- Performance metrics (accuracy, precision, recall)

---

### 8. Predictive Analytics

**Identify Hotspots** (DBSCAN clustering):
```powershell
cd "D:\Hackathon\AI civic issue monitor\ai-service"
& "D:/Hackathon/AI civic issue monitor/.venv/Scripts/python.exe" predictive_analytics.py --action=hotspots
```
Returns:
- Geographic clusters of frequent issues
- Recommended patrol routes
- High-risk areas for proactive monitoring

**Forecast Issues** (Time series prediction):
```powershell
& "D:/Hackathon/AI civic issue monitor/.venv/Scripts/python.exe" predictive_analytics.py --action=forecast --days=30
```
Returns:
- Expected issue count next 30 days
- By ward and type
- Confidence intervals

---

### 9. Dark Mode UI

**Frontend Toggle** (automatic in `frontend/src/context/ThemeContext.jsx`):
```javascript
import { useTheme } from './context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  );
}
```

**Persisted**: Saved in localStorage, applied on page load

---

### 10. Multi-Language Support (i18n)

**Mobile App** (English, Hindi, Gujarati):

```javascript
import { useTranslation } from 'react-i18next';

function MyScreen() {
  const { t, i18n } = useTranslation();
  
  // Use translations
  return <Text>{t('homeScreen.title')}</Text>;
  
  // Change language
  i18n.changeLanguage('hi'); // Hindi
  i18n.changeLanguage('gu'); // Gujarati
  i18n.changeLanguage('en'); // English
}
```

**Add New Translations**: Edit `mobile-app/src/i18n/translations/*.json`

---

### 11. Offline Mode (Mobile App)

**Automatic Sync** when network available:

**Features**:
- Queue issue submissions offline
- Cache issue list for offline viewing
- Auto-sync when connection restored

**Test**:
1. Turn off device WiFi/data
2. Create issue in mobile app
3. Issue saved to local queue
4. Turn on connection
5. App auto-syncs queued issues

**Manual Sync**:
```javascript
import { offlineManager } from './utils/offlineManager';

// Sync manually
await offlineManager.syncQueue();

// Check pending items
const pending = await offlineManager.getPendingItems();
console.log(`${pending.length} items pending sync`);
```

---

## 📊 API Testing Collection

### Authentication

**Register User**:
```powershell
$body = @{
  name = "Test Engineer"
  email = "engineer@test.com"
  password = "Password@123"
  role = "engineer"
  wardId = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/auth/register -Method Post -Headers @{"Content-Type"="application/json"} -Body $body
```

**Login**:
```powershell
$body = @{
  email = "engineer@test.com"
  password = "Password@123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method Post -Headers @{"Content-Type"="application/json"} -Body $body
$token = $response.token
Write-Host "Token: $token"
```

### Create Issue

```powershell
# Note: This requires multipart/form-data, use curl or Postman
curl -X POST http://localhost:3000/api/issues `
  -H "Authorization: Bearer $token" `
  -F "description=Large pothole on main road" `
  -F "type=pothole" `
  -F "priority=high" `
  -F "latitude=22.3072" `
  -F "longitude=73.1812" `
  -F "image=@C:\path\to\image.jpg"
```

### Dashboard Stats

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/dashboard/admin/stats -Method Get -Headers @{"Authorization"="Bearer $token"}
```

---

## 🎯 Testing Checklist

### Core Features (Required):
- [ ] User registration & login
- [ ] Create issue with image upload
- [ ] AI classification of issue type
- [ ] Geo-fencing ward assignment
- [ ] Engineer auto-assignment
- [ ] Issue resolution workflow
- [ ] Dashboard statistics
- [ ] Mobile app camera integration

### Advanced Features (Extra):
- [ ] WebSocket real-time updates
- [ ] Push notifications
- [ ] QR code feedback system
- [ ] PDF/Excel report export
- [ ] Heatmap clustering
- [ ] Route optimization
- [ ] Redis caching
- [ ] ML model training
- [ ] Predictive analytics
- [ ] Dark mode UI
- [ ] Multi-language support
- [ ] Offline mode sync

---

## 🐛 Troubleshooting

### "Database connection failed"
```powershell
# Check if PostgreSQL is running
Get-Service -Name postgresql*

# Start if stopped
Start-Service postgresql-x64-15  # Adjust version number

# Test connection
psql -U postgres -c "SELECT version();"
```

### "Port 3000 already in use"
```powershell
# Find process using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill the process
Stop-Process -Id <ProcessID> -Force
```

### "AI service not responding"
```powershell
# Check if Python virtual environment is activated
& "D:/Hackathon/AI civic issue monitor/.venv/Scripts/python.exe" --version

# Reinstall dependencies if needed
& "D:/Hackathon/AI civic issue monitor/.venv/Scripts/pip.exe" install -r requirements.txt
```

### "Module not found" errors
```powershell
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install

# Mobile
cd mobile-app
npm install
```

---

## 📱 Mobile App Testing

### Using Expo Go:

1. Install Expo Go on your phone (Android/iOS)
2. Start mobile app: `npx expo start`
3. Scan QR code with Expo Go app
4. App loads on your device

### Test Scenarios:

1. **Camera Integration**:
   - Open app → Capture Issue
   - Grant camera permission
   - Take photo of issue
   - Verify image preview

2. **GPS Integration**:
   - Grant location permission
   - Verify location auto-filled
   - Check map shows correct position

3. **Offline Mode**:
   - Turn off internet
   - Create issue
   - Check "Queued for sync" status
   - Turn on internet
   - Verify auto-sync

4. **Language Switch**:
   - Settings → Language
   - Switch to Hindi/Gujarati
   - Verify UI updates

---

## 🔍 Performance Testing

### Load Testing (Optional - requires `artillery`):

```powershell
npm install -g artillery

# Create load test
@"
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Get Issues'
    flow:
      - get:
          url: '/api/issues'
"@ | Out-File loadtest.yml

# Run test
artillery run loadtest.yml
```

---

## 📈 Monitoring

### Logs:
```powershell
# Backend logs
Get-Content "backend\logs\combined.log" -Tail 50 -Wait

# Error logs only
Get-Content "backend\logs\error.log" -Tail 50 -Wait
```

### Resource Usage:
```powershell
# Check Node.js memory usage
Get-Process -Name node | Select-Object CPU,WorkingSet,ProcessName

# Check Python memory usage
Get-Process -Name python | Select-Object CPU,WorkingSet,ProcessName
```

---

## 🎓 Next Steps

1. **Complete Database Setup** (Required for core functionality)
2. **Test Core Features** using API endpoints above
3. **Test Advanced Features** one by one
4. **Deploy to Free Tier** using `FREE_TIER_DEPLOYMENT.md`
5. **Load Test** with expected user count
6. **Security Audit** before production deployment

---

## 📞 Support

- Backend API Docs: http://localhost:3000/api-docs
- Architecture Docs: `plans/architecture.md`
- Database Schema: `plans/database_schema.md`
- Team Assignments: `plans/TEAM_ASSIGNMENTS.md`

**Current Status**: Backend and AI service running successfully. Database needs setup for full functionality.


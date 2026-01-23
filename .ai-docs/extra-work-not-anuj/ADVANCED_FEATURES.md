# Advanced Features Implementation Guide

## Overview
This document describes the advanced features implemented in the Civic Issue Monitoring System.

## Features Implemented

### 1. WebSocket Real-Time Updates
**Location**: `backend/src/websocket.js`

**Features**:
- Real-time bidirectional communication between server and clients
- JWT authentication for WebSocket connections
- User presence tracking and heartbeat monitoring
- Broadcast capabilities (user, role, ward-specific, global)
- Auto-reconnection handling

**Integration**:
```javascript
// In server.js
const { initializeWebSocket, notifyNewIssue } = require('./websocket');
const server = require('http').createServer(app);
initializeWebSocket(server);

// Notify on issue creation
notifyNewIssue(issue);
```

**Client Connection**:
```javascript
const ws = new WebSocket(`ws://localhost:3000/ws?token=${authToken}`);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

---

### 2. Mobile Push Notifications
**Location**: `backend/src/utils/pushNotificationService.js`

**Features**:
- Firebase Cloud Messaging (FCM) integration
- Multi-device support per user
- Platform-specific configurations (Android/iOS)
- Automatic invalid token cleanup
- Role-based broadcasting

**Setup**:
1. Create Firebase project at https://console.firebase.google.com
2. Download service account JSON
3. Add to `.env`:
```bash
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...",...}'
```

**Usage**:
```javascript
const pushService = require('./utils/pushNotificationService');

// Register device
await pushService.registerToken(userId, fcmToken, deviceId, 'android');

// Send notification
await pushService.notifyIssueAssigned(engineerId, issue);
```

**Database**: Run `database/advanced_features.sql` to create `user_devices` table.

---

### 3. QR Code Feedback System
**Location**: `backend/src/routes/feedback.js`

**Features**:
- QR code generation for resolved issues
- Public feedback submission endpoint
- Rating system (1-5 stars)
- Location verification option
- Feedback analytics and statistics

**API Endpoints**:
```
GET  /api/feedback/issue/:id/qr        - Generate QR code
POST /api/feedback/:id                  - Submit feedback (public)
GET  /api/feedback/:id                  - Get feedback details
GET  /api/feedback/stats/summary        - Aggregate statistics
GET  /api/feedback/recent               - Recent comments
POST /api/feedback/bulk-qr              - Bulk QR generation
```

**Frontend Integration**:
```jsx
// Generate QR code
const response = await fetch(`/api/feedback/issue/${issueId}/qr`);
const { qrCode } = await response.json();
<img src={qrCode} alt="Feedback QR" />
```

---

### 4. Dark Mode UI
**Location**: `frontend/src/styles/dark-mode.css`, `frontend/src/context/ThemeContext.jsx`

**Features**:
- CSS custom properties for theme switching
- System preference detection
- LocalStorage persistence
- Smooth transitions
- Component: `ThemeToggle.jsx`

**Integration**:
```jsx
// In App.jsx
import { ThemeProvider } from './context/ThemeContext';
import './styles/dark-mode.css';

<ThemeProvider>
  <YourApp />
</ThemeProvider>

// In components
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './context/ThemeContext';

const { theme, isDark, toggleTheme } = useTheme();
```

**CSS Variables**:
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--accent-primary`, `--accent-hover`
- Automatically applied via `[data-theme="dark"]`

---

### 5. Report Export (PDF/Excel)
**Location**: `backend/src/routes/reports.js`

**Features**:
- PDF generation with PDFKit
- Excel generation with ExcelJS
- Customizable filters (ward, status, priority, date range)
- Summary statistics
- Conditional formatting in Excel
- Ward performance reports

**API Endpoints**:
```
POST /api/reports/export/pdf              - Generate PDF report
POST /api/reports/export/excel            - Generate Excel report
GET  /api/reports/export/ward-performance - Ward performance PDF
```

**Request Body**:
```json
{
  "ward_id": 1,
  "status": "resolved",
  "priority": "high",
  "start_date": "2026-01-01",
  "end_date": "2026-01-31"
}
```

**Dependencies**:
```bash
npm install pdfkit exceljs
```

---

### 6. ML Model Training
**Location**: `ai-service/train_model.py`

**Features**:
- Transfer learning with MobileNetV2
- Two-phase training (frozen → fine-tuning)
- Data augmentation
- TensorBoard logging
- TFLite export for mobile
- Comprehensive evaluation metrics

**Usage**:
```bash
cd ai-service

# Prepare data structure:
# data/
#   pothole/
#   garbage_overflow/
#   street_light/
#   ...

python train_model.py --data-dir data/ --epochs-initial 10 --epochs-fine-tune 10

# Outputs:
# - models/civic_issue_classifier.h5
# - models/class_indices.json
# - models/exported/civic_classifier/ (SavedModel)
# - models/exported/civic_classifier.tflite
```

**Replace Placeholder in app.py**:
```python
# Load trained model
model = tf.keras.models.load_model('models/civic_issue_classifier.h5')

@app.route('/api/detect', methods=['POST'])
def detect_issue():
    image = preprocess_image(file_path)
    predictions = model.predict(image)
    class_idx = np.argmax(predictions[0])
    confidence = float(predictions[0][class_idx])
    # Return predictions
```

---

### 7. Predictive Analytics
**Location**: `ai-service/predictive_analytics.py`

**Features**:
- DBSCAN hotspot detection
- Time series forecasting with Random Forest
- Ward workload prediction
- Seasonal pattern analysis
- Geographic clustering

**Usage**:
```bash
cd ai-service

# Configure database in .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civic_issues
DB_USER=postgres
DB_PASSWORD=postgres

python predictive_analytics.py

# Generates: analytics_report.json
```

**Report Structure**:
```json
{
  "hotspots": [...],          // Geographic clusters
  "future_predictions": [...], // 7-day forecasts by type
  "ward_workload": [...],      // Predicted workload per ward
  "seasonal_patterns": {...}   // Temporal patterns
}
```

**API Integration** (add to dashboard routes):
```javascript
router.get('/analytics/report', authMiddleware, authorize('admin'), async (req, res) => {
  const report = require('../../ai-service/analytics_report.json');
  res.json(report);
});
```

---

### 8. Offline Mobile Mode
**Location**: `mobile-app/src/utils/offlineManager.js`

**Features**:
- Network status monitoring
- Action queue with retry logic
- AsyncStorage persistence
- Auto-sync when online
- Offline data caching

**Integration**:
```javascript
import offlineManager from './utils/offlineManager';

// Add action to queue
await offlineManager.addToQueue({
  type: 'CREATE_ISSUE',
  data: { latitude, longitude, image, description }
});

// Manual sync
const result = await offlineManager.syncPendingActions();

// Get status
const status = await offlineManager.getSyncStatus();
// { isOnline, isSyncing, pendingCount, lastSync }

// Check connection
const isOnline = await offlineManager.isDeviceOnline();
```

**Dependencies**:
```bash
npm install @react-native-async-storage/async-storage @react-native-community/netinfo
```

---

### 9. Multi-Language Support (i18n)
**Location**: `mobile-app/src/i18n/index.js`

**Languages**:
- English (en)
- Hindi (hi)
- Gujarati (gu)

**Usage**:
```javascript
import { useTranslation } from 'react-i18next';
import { changeLanguage, getAvailableLanguages } from './i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('appName')}</Text>
      <Text>{t('issueReported')}</Text>
    </View>
  );
}

// Change language
await changeLanguage('hi');

// Get available languages
const languages = getAvailableLanguages();
// [{ code: 'en', name: 'English', nativeName: 'English' }, ...]
```

**Dependencies**:
```bash
npm install i18next react-i18next
```

---

### 10. Advanced Geospatial Features
**Location**: `backend/src/routes/geospatial.js`

**Features**:
- Heatmap with clustering
- Ward boundary GeoJSON export
- Route calculation
- Nearby issue search with radius
- Spatial statistics (density per ward)
- Hotspot identification with DBSCAN

**API Endpoints**:
```
GET /api/geospatial/heatmap                - Clustered heatmap data
GET /api/geospatial/wards/boundaries       - Ward polygons as GeoJSON
POST /api/geospatial/route                 - Calculate route
GET /api/geospatial/nearby                 - Find nearby issues
GET /api/geospatial/stats/spatial          - Spatial statistics
GET /api/geospatial/hotspots               - Identify hotspots
```

**Database**: Run `database/advanced_features.sql` for spatial indexes and density grid.

---

## Deployment Checklist

### Backend Updates
1. **Install dependencies**:
```bash
cd backend
npm install ws qrcode pdfkit exceljs firebase-admin
```

2. **Update server.js**:
```javascript
const { initializeWebSocket } = require('./websocket');
const server = require('http').createServer(app);

app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/geospatial', require('./routes/geospatial'));

initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

3. **Environment variables**:
```bash
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
FRONTEND_URL=http://localhost:3001
```

4. **Database migrations**:
```bash
psql -U postgres -d civic_issues -f database/advanced_features.sql
```

### Frontend Updates
1. **Install dependencies**:
```bash
cd frontend
npm install @heroicons/react
```

2. **Import dark mode CSS** in `main.jsx` or `App.jsx`:
```javascript
import './styles/dark-mode.css';
```

3. **Wrap app with ThemeProvider**:
```jsx
import { ThemeProvider } from './context/ThemeContext';

<ThemeProvider>
  <RouterProvider router={router} />
</ThemeProvider>
```

### Mobile Updates
1. **Install dependencies**:
```bash
cd mobile-app
npm install @react-native-async-storage/async-storage @react-native-community/netinfo i18next react-i18next
```

2. **Initialize in App.js**:
```javascript
import './src/i18n';  // At top of file
import offlineManager from './src/utils/offlineManager';

// In component
useEffect(() => {
  offlineManager.loadSyncQueue();
  
  return () => offlineManager.destroy();
}, []);
```

### AI Service Updates
1. **Install dependencies**:
```bash
cd ai-service
pip install tensorflow scikit-learn pandas matplotlib seaborn psycopg2-binary
```

2. **Train model** (requires labeled dataset):
```bash
python train_model.py --data-dir path/to/training/data
```

3. **Update app.py** to use trained model instead of placeholder.

4. **Run analytics** (schedule as cron job):
```bash
python predictive_analytics.py
```

---

## Performance Considerations

- **WebSocket**: Limit max connections per server (use Redis adapter for scaling)
- **Push Notifications**: Batch notifications, use FCM multicast (up to 500 tokens)
- **Geospatial**: Leverage PostGIS spatial indexes, cache ward boundaries
- **Reports**: Generate async for large datasets, use job queue
- **Offline**: Limit queue size, implement cleanup policy
- **Heatmap**: Cache aggressively, use clustering for 1000+ points

---

## Security Notes

- WebSocket connections require JWT authentication
- FCM service account credentials must be kept secure
- QR feedback endpoint is public but validates issue status
- Geospatial queries use parameterized statements
- Report generation has role-based access control

---

## Testing

Run comprehensive tests:
```bash
# Backend
cd backend && npm test

# AI Service
cd ai-service && pytest test_app.py

# Mobile (requires running app)
cd mobile-app && npm test
```

---

## Monitoring

Track key metrics:
- WebSocket connection count: `GET /api/ws/stats`
- Push notification success rate: Check Firebase console
- QR scan rate: Query `citizen_feedback` table
- Offline sync success: Mobile app analytics
- Hotspot detection accuracy: Compare with historical data

---

## Future Enhancements

- Voice input for issue reporting (speech-to-text)
- Augmented Reality (AR) for visualizing resolved issues
- Blockchain for tamper-proof issue audit trail
- Advanced ML: Object detection in images (YOLOv8)
- Sentiment analysis on feedback comments
- Integration with existing municipal ERP systems

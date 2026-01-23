# Civic Issue Monitoring - Mobile App (React Native)

Field Surveyor Mobile Application for reporting and tracking civic issues.

## Features

- 📸 Camera integration for capturing issue photos
- 📍 GPS location tagging
- 🔄 Offline mode with auto-sync
- 🔔 Push notifications
- 📊 Issue tracking and history
- 🗺️ Map visualization
- 🔐 Secure authentication

## Tech Stack (100% FREE & OPEN-SOURCE)

- **Framework:** React Native with Expo
- **State Management:** Redux Toolkit
- **Navigation:** React Navigation
- **Camera:** expo-camera
- **Location:** expo-location
- **Offline Storage:** AsyncStorage + SQLite
- **Notifications:** expo-notifications
- **Maps:** React Native Maps (OpenStreetMap)
- **UI:** React Native Paper

## Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Physical device for testing (recommended)

## Installation

### 1. Install Dependencies

```bash
cd Mobile_Application
npm install
```

### 2. Install Expo CLI

```bash
npm install -g expo-cli
```

### 3. Configure Backend URL

Edit `src/config/constants.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_BACKEND_IP:3000/api',
  AI_SERVICE_URL: 'http://YOUR_AI_SERVICE_IP:8000',
};
```

**Note:** Use your computer's IP address (not localhost) for testing on physical devices.

## Running the App

### Development Mode

```bash
npm start
```

This will open Expo Dev Tools. You can then:

- **iOS:** Press `i` or scan QR code with Camera app
- **Android:** Press `a` or scan QR code with Expo Go app
- **Web:** Press `w` (limited functionality)

### Run on Specific Platform

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## Project Structure

```
Mobile_Application/
├── src/
│   ├── components/        # Reusable components
│   ├── config/           # Configuration and constants
│   ├── navigation/       # Navigation setup
│   ├── screens/          # App screens
│   │   ├── auth/        # Authentication screens
│   │   ├── home/        # Dashboard
│   │   ├── camera/      # Camera/capture
│   │   ├── report/      # Issue reporting
│   │   ├── history/     # Issue history
│   │   ├── detail/      # Issue details
│   │   └── profile/     # User profile
│   ├── services/         # API and utility services
│   ├── store/           # Redux store and slices
│   └── utils/           # Helper functions
├── assets/              # Images, fonts, icons
├── App.js              # Root component
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## Key Features Implementation

### 📸 Camera Integration

```javascript
import { Camera } from 'expo-camera';
// Capture photo with GPS coordinates
```

### 📍 GPS Location

```javascript
import * as Location from 'expo-location';
// Get current location with high accuracy
```

### 💾 Offline Mode

- Issues stored locally when offline
- Auto-sync when connection restored
- Queue management for pending submissions

### 🔔 Push Notifications

- Issue status updates
- Assignment notifications
- SLA breach alerts

## Screens

### 1. Authentication
- **LoginScreen** - User login

### 2. Main App
- **HomeScreen** - Dashboard with stats
- **CameraScreen** - Capture issue photo
- **ReportIssueScreen** - Issue submission form
- **IssueHistoryScreen** - My submitted issues
- **IssueDetailScreen** - View issue details
- **NotificationsScreen** - Push notifications
- **ProfileScreen** - User profile and settings

## API Integration

The app connects to:
- **Backend API** (`http://localhost:3000/api`)
- **AI Service** (`http://localhost:8000`)

### Example API Calls

```javascript
// Submit issue
POST /api/issues
{
  "latitude": 22.3072,
  "longitude": 73.1812,
  "image_url": "base64_or_url",
  "description": "Large pothole"
}

// Get my issues
GET /api/issues?submitted_by=USER_ID

// Get issue details
GET /api/issues/:id
```

## Building for Production

### Android APK

```bash
expo build:android
```

### iOS IPA

```bash
expo build:ios
```

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build
eas build --platform android
eas build --platform ios
```

## Testing

### On Physical Device

1. Install **Expo Go** app from Play Store/App Store
2. Scan QR code from `expo start`
3. App loads on your device

### Permissions Required

- **Camera** - Capture issue photos
- **Location** - Tag issue location
- **Storage** - Save photos locally
- **Notifications** - Push notifications

## Offline Functionality

The app works offline with:
- Local image storage
- SQLite for issue queue
- Auto-sync when online
- Network status indicator

## Troubleshooting

### Cannot connect to backend

```bash
# Use computer's IP instead of localhost
# Find IP: ipconfig (Windows) or ifconfig (Mac/Linux)
BASE_URL: 'http://192.168.1.100:3000/api'
```

### Camera not working

```bash
# Request permissions
await Camera.requestCameraPermissionsAsync();
```

### Location not working

```bash
# Request permissions
await Location.requestForegroundPermissionsAsync();
```

## Environment Variables

Create `.env` file:

```env
API_BASE_URL=http://192.168.1.100:3000/api
AI_SERVICE_URL=http://192.168.1.100:8000
```

## Contributing

This is part of the PU Code Hackathon 3.0 project.

**Team Member:** Abhishek (Mobile Development)

## License

MIT

## Support

For issues, check:
1. Backend is running (`http://localhost:3000/health`)
2. AI service is running (`http://localhost:8000/health`)
3. Using correct IP address (not localhost on device)
4. Permissions granted for camera/location

---

**Status:** 🚧 In Development

**Next Steps:**
1. Complete all screen implementations
2. Add offline sync logic
3. Implement push notifications
4. Add map visualization
5. Test on physical devices
6. Build production APK/IPA

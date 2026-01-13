# VMC Field Surveyor Mobile App

React Native mobile application for field surveyors to capture and report civic issues.

## Features
- Camera integration for issue photography
- GPS location capture
- Real-time issue submission
- Issue history tracking
- Offline support (coming soon)

## Setup

### Prerequisites
- Node.js (v16+)
- Expo CLI
- Android Studio or Xcode (for device testing)

### Installation

1. Install dependencies:
```bash
cd mobile-app
npm install
```

2. Configure API endpoint:
Edit `src/context/AuthContext.js` and update the `API_URL`:
```javascript
const API_URL = 'http://your-backend-url:3000/api';
```

3. Start the development server:
```bash
npx expo start
```

4. Run on device:
- Scan QR code with Expo Go app (Android/iOS)
- Press `a` for Android emulator
- Press `i` for iOS simulator

## Permissions Required
- Camera access
- Location access (GPS)
- Photo library access

## Screens

### Login Screen
- Email/password authentication
- For VMC surveyors only

### Home Screen
- Quick access to capture issue
- View issue history
- Tips and guidelines

### Capture Issue Screen
- Take photo or choose from gallery
- Automatic GPS location capture
- Submit issue to backend

### Issue History Screen
- View all reported issues
- Filter by status
- View issue details

## Building for Production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## Troubleshooting

### Camera not working
- Ensure camera permissions are granted
- Check device camera functionality

### Location not capturing
- Enable GPS/location services
- Grant location permissions to app

### Cannot submit issues
- Check internet connection
- Verify API endpoint configuration
- Ensure backend server is running

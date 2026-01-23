# Field Surveyor Web App

Mobile-first web application for field surveyors to report civic issues. Works on phones and can be converted to native mobile apps using Capacitor.

## ✅ Completed Setup

### Project Structure
```
field-surveyor-app/
├── src/
│   ├── components/       # Reusable UI components
│   │   └── BottomNav.jsx
│   ├── pages/           # Main application pages
│   │   ├── Login.jsx
│   │   ├── Home.jsx
│   │   ├── ReportIssue.jsx
│   │   ├── IssueList.jsx
│   │   ├── IssueDetail.jsx
│   │   └── Profile.jsx
│   ├── services/        # API and storage services
│   │   ├── api.js
│   │   └── offlineStorage.js
│   ├── store/           # Redux state management
│   │   ├── index.js
│   │   ├── authSlice.js
│   │   └── issueSlice.js
│   ├── config/          # Configuration
│   │   └── constants.js
│   ├── utils/           # Helper functions
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles with Tailwind
├── public/
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

### Technologies Used
- **React 18** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Localforage** - Offline storage (IndexedDB wrapper)
- **React-Leaflet** - Maps integration

### Features Implemented (Backend)
- ✅ API service with authentication
- ✅ Offline storage with IndexedDB
- ✅ Sync queue for offline-first functionality
- ✅ Redux store for global state
- ✅ Routing with protected routes
- ✅ Bottom navigation component
- ✅ Configuration for issue types and priorities

## 🚧 Next Steps

### Pages to Complete (Priority Order):

1. **Login Page** - Authentication UI
2. **Home Page** - Dashboard with stats and quick actions  
3. **Report Issue Page** - Camera/upload + GPS + Form
4. **Issue List Page** - Searchable list with filters
5. **Issue Detail Page** - Full details with map
6. **Profile Page** - User info and logout

### Key Features to Implement:

**Camera/Image Capture:**
- File input for image upload
- Webcam API for direct capture on devices
- Image compression before upload
- Preview and retake functionality

**GPS Location:**
- Geolocation API for current location
- Reverse geocoding (coordinates → address)
- Map picker for manual location selection
- Leaflet map integration

**Offline Support:**
- Save issues to IndexedDB when offline
- Auto-sync when connection restored
- Sync queue with retry logic
- Offline indicator in UI

**Mobile-First UI:**
- Touch-friendly buttons (min 44x44px)
- Bottom navigation
- Pull-to-refresh
- Responsive design for all screen sizes
- PWA manifest for installability

## Running the App

```bash
cd field-surveyor-app
npm install
npm run dev
```

Access at: http://localhost:5173

## Converting to Mobile App (Later)

### Using Capacitor:

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/camera @capacitor/geolocation

# Initialize
npx cap init

# Add platforms
npx cap add android
npx cap add ios

# Build and sync
npm run build
npx cap sync

# Open in native IDEs
npx cap open android
npx cap open ios
```

## API Configuration

Update `src/config/constants.js` with your backend URLs:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_SERVER_IP:3000/api',
  AI_SERVICE_URL: 'http://YOUR_SERVER_IP:8000',
};
```

## Authentication

Login credentials (from backend):
- Role: field_surveyor
- Use JWT token stored in localStorage

## Current Status

✅ Project scaffolded
✅ Dependencies installed
✅ Core services created
✅ Redux store configured
✅ Routing setup
✅ Bottom navigation
⏳ Pages need implementation
⏳ Camera feature needs implementation
⏳ GPS feature needs implementation

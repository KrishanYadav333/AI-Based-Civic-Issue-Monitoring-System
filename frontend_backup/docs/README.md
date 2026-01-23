# Frontend Documentation

This folder contains all documentation specific to the **Web Dashboard (Frontend)** React.js application.

---

## 📚 Documentation Files

### Implementation & Completion
- **[DELIVERABLES_COMPLETED.md](DELIVERABLES_COMPLETED.md)** - List of completed features and deliverables
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Summary of implementation details
- **[PROJECT_COMPLETION_REPORT.md](PROJECT_COMPLETION_REPORT.md)** - Final project completion report
- **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)** - Verification checklist for all features

### Setup & Quick Start
- **[QUICK_START.md](QUICK_START.md)** - Quick start guide for running the frontend
- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Index of all documentation

---

## 🚀 Quick Start

```bash
# From frontend folder
npm install
npm run dev  # http://localhost:5173
```

---

## 🎯 Frontend Features

### ✅ Engineer Dashboard
- Issue list with filters
- Issue detail panel
- Resolution workflow
- Performance dashboard

### ✅ Admin Dashboard
- Overview dashboard
- Map view with heatmap
- Analytics & reports
- User management

---

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite
- **State:** Redux Toolkit
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Maps:** Leaflet (OpenStreetMap)
- **Routing:** React Router v6
- **HTTP:** Axios
- **Icons:** Lucide React
- **Animations:** Framer Motion

---

## 📝 Environment Configuration

See `../.env` file for configuration:

```bash
VITE_API_URL=http://localhost:3001/api
VITE_USE_MOCK=true  # Set to false when backend is ready
```

---

## 🔗 Related Documentation

### Project-Level Documentation (in root)
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Complete integration guide
- [INTEGRATION_SUMMARY.md](../../INTEGRATION_SUMMARY.md) - Quick integration reference
- [TEAM_CHECKLIST.md](../../TEAM_CHECKLIST.md) - Team task lists
- [PROJECT_STRUCTURE.md](../../PROJECT_STRUCTURE.md) - Project folder structure
- [README.md](../../README.md) - Main project readme

### Backend Documentation
- [backend/README.md](../../backend/README.md) - Backend setup guide

### Mobile App
- [MOBILE_APP_API_TEMPLATE.js](../../MOBILE_APP_API_TEMPLATE.js) - Mobile API integration

---

## 📦 Key Folders

```
frontend/
├── docs/                   ← You are here
├── src/
│   ├── components/         # React components
│   │   ├── admin/         # Admin-specific
│   │   ├── engineer/      # Engineer-specific
│   │   └── common/        # Shared components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── store/             # Redux store
│   ├── styles/            # CSS files
│   └── utils/             # Utility functions
├── public/                # Static assets
├── .env                   # Environment variables
└── package.json           # Dependencies
```

---

## 🎨 Component Architecture

### Pages (Routes)
- `/login` - Login page
- `/dashboard` - Admin dashboard
- `/engineer/dashboard` - Engineer dashboard
- `/engineer/issues` - Issue list
- `/engineer/performance` - Performance metrics
- `/admin/map` - Map view
- `/admin/analytics` - Analytics & reports
- `/admin/users` - User management

### State Management (Redux)
- `authSlice` - Authentication state
- `issueSlice` - Issues data
- `analyticsSlice` - Analytics & users

---

## 🧪 Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## 🏗️ Build for Production

```bash
npm run build         # Creates dist/ folder
npm run preview       # Preview production build
```

---

## 📞 Support

For frontend-specific questions:
- **Team Member:** Aditi
- **Related:** Web Dashboard, React.js, UI/UX

For integration questions, see project-level documentation in root folder.

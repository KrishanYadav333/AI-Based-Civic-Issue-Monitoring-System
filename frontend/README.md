# Civic Issue Management Dashboard

A modern, responsive web application for managing civic issues in a city/ward. The system features role-based dashboards for both Engineers and Administrators with real-time issue tracking, analytics, and map integration.

## 🎯 Features

### Engineer Dashboard
- **Issue List View**: Browse assigned issues with filters and search
- **Issue Details**: View full issue information with images and location
- **Resolution Workflow**: Accept issues, upload resolution images, and mark as resolved
- **Performance Metrics**: Track personal statistics and performance trends
- **Comments System**: Collaborate with timeline-style comments

### Admin Dashboard
- **Overview Dashboard**: Key metrics and system health monitoring
- **Map View**: Interactive Leaflet map with issue clustering and heatmaps
- **Analytics**: Charts and reports (Ward performance, Issue trends, Type distribution)
- **User Management**: Create, edit, and manage engineers and admins
- **Export Functionality**: Export reports as CSV/PDF

### Common Features
- ✓ Role-based authentication and routing
- ✓ Dark mode / Light mode toggle
- ✓ Responsive design (mobile, tablet, desktop)
- ✓ Real-time notifications
- ✓ Smooth animations with Framer Motion
- ✓ Modern glassmorphism UI with Tailwind CSS
- ✓ Redux state management
- ✓ 50+ realistic mock issues

## 🛠️ Tech Stack

**Frontend**
- React 18
- Vite
- Redux Toolkit
- React Router

**Styling & UI**
- Tailwind CSS
- Framer Motion
- Lucide React Icons

**Charts & Maps**
- Recharts (Bar, Pie, Line charts)
- Leaflet + React Leaflet (OpenStreetMap)

**HTTP & State**
- Axios
- Redux Toolkit

**Testing**
- Jest
- React Testing Library

**No External API Keys Required** - Uses free/open-source services

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm

### Setup Steps

```bash
# Navigate to project directory
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

The app will be available at `http://localhost:5173`

## 🔐 Demo Credentials

### Admin Account
- **Email**: admin@example.com
- **Password**: password
- **Access**: Full dashboard, analytics, user management, map view

### Engineer Account
- **Email**: engineer1@example.com
- **Password**: password
- **Access**: Issue list, my issues, performance tracking

## 📁 Project Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── common/              # Shared components
│   │   │   ├── Badges.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── FormElements.jsx
│   │   │   ├── Loaders.jsx
│   │   │   └── Alerts.jsx
│   │   ├── engineer/            # Engineer-specific components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── IssueList.jsx
│   │   │   ├── IssueDetailPanel.jsx
│   │   │   └── PerformanceDashboard.jsx
│   │   └── admin/              # Admin-specific components
│   │       ├── Dashboard.jsx
│   │       ├── UserManagement.jsx
│   │       ├── Analytics.jsx
│   │       └── MapView.jsx
│   ├── pages/                   # Page components
│   ├── store/                   # Redux slices and store
│   │   ├── authSlice.js
│   │   ├── issueSlice.js
│   │   ├── analyticsSlice.js
│   │   └── index.js
│   ├── services/                # API services
│   │   └── api.js
│   ├── utils/                   # Helper functions
│   │   └── helpers.js
│   ├── data/                    # Mock data
│   │   └── mockData.js
│   ├── styles/                  # Global styles
│   │   └── index.css
│   ├── __tests__/              # Test files
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── jest.config.js
└── README.md
```

## → Key Features Explained

### 1. Issue Management
- **Filter & Search**: Filter by priority, type, status, ward, and search by title
- **Issue Detail Panel**: Side drawer showing full issue details, images, map, and comments
- **Resolution Workflow**: Engineers can mark issues as resolved with images and notes

### 2. Analytics & Reporting
- **Ward Performance Chart**: Stacked bar chart showing issue distribution by ward
- **Issue Type Pie Chart**: Visualization of issue types
- **Time Series Chart**: Track issue trends over time
- **Export to CSV**: Download reports for offline analysis

### 3. Map Integration
- **Interactive Leaflet Map**: Displays all issues as markers
- **Color-Coded Markers**: Red (critical), Orange (high), Yellow (medium), Green (low)
- **Popup Information**: Click markers to view issue details
- **Responsive**: Adapts to different screen sizes

### 4. User Management (Admin Only)
- **Create Users**: Add new engineers or administrators
- **Assign Wards**: Assign engineers to specific wards
- **Role Management**: Switch between engineer and admin roles
- **Delete Users**: Remove users from the system

### 5. Performance Tracking
- **Metrics Dashboard**: Resolution count, average time, and success rate
- **Issue Distribution**: Visual breakdown by status and priority
- **Weekly Activity**: Line chart showing daily resolutions and assignments

## 🎨 Design Highlights

- **Modern Glassmorphism**: Semi-transparent cards with backdrop blur
- **Dark Mode**: Full dark mode support with smooth transitions
- **Animations**: Smooth fade-ins and slide-ups with Framer Motion
- **Responsive Grid**: Auto-adapting layouts for all screen sizes
- **Color System**: Consistent primary, success, warning, and danger colors
- **Typography**: Clean hierarchy with proper spacing

## [Data] Mock Data

The app includes 60+ realistic civic issues covering:
- Road Damage (potholes, cracks, markings)
- Streetlight Issues (broken, missing)
- Water Leakage (flooding, pipe breaks, drainage)
- Garbage (illegal dumping, accumulation)
- Infrastructure (broken benches, railings, gates)
- Graffiti
- Traffic Control
- Vegetation (overgrown, dead trees)
- And more...

Each issue includes:
- Priority level (critical to low)
- Status (pending, assigned, in-progress, resolved)
- Location coordinates for map display
- Images (before and after)
- Comments timeline
- Assigned engineer

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Tests include:
- Component rendering tests
- Helper function tests
- Redux action tests (planned)
- Integration tests (planned)

## 🔄 Redux Store Structure

```javascript
{
  auth: {
    user: { id, name, email, role, wardAssigned },
    isAuthenticated: boolean,
    loading: boolean,
    error: null
  },
  issues: {
    issues: [],
    selectedIssue: null,
    loading: boolean,
    filters: { priority, type, status, ward },
    searchQuery: string,
    sortBy: string
  },
  users: {
    users: [],
    loading: boolean,
    error: null
  }
}
```

## 🎯 Roadmap

- [ ] Backend API integration
- [ ] Real database (PostgreSQL/MongoDB)
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Mobile app with React Native
- [ ] Advanced analytics with AI predictions
- [ ] Real-time WebSocket updates
- [ ] File upload to cloud storage

## [Mobile] Responsive Breakpoints

- **Mobile**: 320px and up
- **Tablet**: 768px and up
- **Desktop**: 1024px and up
- **Large Desktop**: 1280px and up

## 🌙 Dark Mode

Dark mode is implemented at all levels:
- Tailwind CSS dark mode utilities
- Custom dark mode colors
- Smooth transitions between modes
- Persistent user preference (localStorage)

## 🔒 Security Notes

- This is a demo application with mock authentication
- In production, implement:
  - JWT token validation
  - HTTPS encryption
  - Rate limiting
  - Input validation
  - XSS/CSRF protection

## [Document] License

Open source - feel free to use and modify

## [Code] Development

### Adding New Components
1. Create component in appropriate folder
2. Export from parent index (if needed)
3. Use Tailwind classes for styling
4. Add Framer Motion for animations
5. Connect to Redux if needed

### Styling Guidelines
- Use Tailwind CSS utilities
- Follow color system (primary, success, warning, danger)
- Use `dark:` prefix for dark mode
- Maintain consistent spacing (gap, padding, margin)

### State Management
- Use Redux Toolkit slices
- Keep components focused on UI
- Dispatch actions for data changes
- Use selectors for state access

## 🙏 Acknowledgments

- Leaflet for mapping
- OpenStreetMap for map tiles
- Recharts for charts
- Framer Motion for animations
- Tailwind CSS for styling

---

**Built with ❤️ for Modern Web Development**

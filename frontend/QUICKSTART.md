# Quick Start Guide

## Getting Started in 5 Minutes

### 1. Installation
```bash
cd dashboard
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to: `http://localhost:5173`

### 4. Login

**Admin Account:**
- Email: `admin@example.com`
- Password: `password`

**Engineer Account:**
- Email: `engineer1@example.com`
- Password: `password`

## What You'll See

### Admin Dashboard
- **Dashboard Tab**: Overview of all metrics and recent activity
- **Map View**: Interactive map showing all issues with color-coded markers
- **Analytics**: Charts showing ward performance, issue trends, and types
- **User Management**: Create/edit/delete engineers and admins

### Engineer Dashboard
- **Dashboard Tab**: Personal performance metrics
- **My Issues Tab**: List of assigned issues with filters
- **Performance Tab**: Charts showing resolution stats and trends

## Key Interactions

### Engineer Workflow
1. Login as engineer
2. Go to "My Issues" tab
3. Click on an issue to open details panel
4. View issue info, images, and location
5. Add comments
6. Mark as resolved with images
7. Check performance dashboard

### Admin Workflow
1. Login as admin
2. View dashboard for system overview
3. Check map to see issue distribution
4. View analytics for trends
5. Manage users in user management
6. Export reports as CSV

## Features Checklist

- ✓ Two role-based dashboards (Admin/Engineer)
- ✓ Issue list with search and filters
- ✓ Issue detail panel with images and comments
- ✓ Resolution workflow with image upload
- ✓ Interactive Leaflet map
- ✓ Multiple charts (Bar, Pie, Line)
- ✓ User management system
- ✓ CSV export functionality
- ✓ Dark/Light mode toggle
- ✓ Responsive design
- ✓ Modern UI with animations
- ✓ 60+ realistic mock issues

## Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## Run Tests

```bash
npm test
```

## File Structure Overview

```
dashboard/
├── src/
│   ├── components/
│   │   ├── common/       → Shared UI components
│   │   ├── engineer/     → Engineer-specific
│   │   └── admin/        → Admin-specific
│   ├── pages/            → Page components
│   ├── store/            → Redux state
│   ├── services/         → API calls
│   ├── utils/            → Helper functions
│   ├── data/             → Mock data
│   ├── App.jsx           → Main app
│   └── main.jsx          → Entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Common Tasks

### Change Mock Data
Edit `src/data/mockData.js`

### Add New Issue Status
Edit `tailwind.config.js` and relevant components

### Customize Colors
Update `tailwind.config.js` theme colors

### Add New Chart
Create in appropriate component and import Recharts

### Modify Dashboard Layout
Edit component in `src/components/[admin|engineer]/`

## Troubleshooting

### Port 5173 Already in Use
```bash
npm run dev -- --port 3000
```

### Styles Not Loading
Clear cache and restart:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Map Not Showing
Check browser console for Leaflet errors. Ensure Leaflet CSS is loaded in `index.html`

## Performance Tips

- Use Redux selectors to avoid unnecessary re-renders
- Lazy load components for better initial load
- Use React.memo for expensive components
- Debounce search input

## Next Steps

1. ✓ Explore the admin dashboard
2. ✓ Try engineer workflows
3. ✓ Test different filters and searches
4. ✓ View charts and analytics
5. ✓ Test responsive design on mobile
6. ✓ Toggle dark mode

## Need Help?

- Check the main README.md for detailed documentation
- Review component comments for explanations
- Check Redux slices for state management flow
- Test individual components in isolation

---

**Happy exploring!**

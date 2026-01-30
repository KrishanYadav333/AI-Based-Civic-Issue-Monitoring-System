import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { restoreAuth } from './store/authSlice';
import ProtectedRoute from './pages/ProtectedRoute';
import MainLayout from './pages/MainLayout';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import SubmitIssue from './pages/SubmitIssue';
import SurveyorDashboard from './pages/SurveyorDashboard';
import ReportIssue from './pages/ReportIssue';
import IssueList from './pages/IssueList';
import IssueDetail from './pages/IssueDetail';
import Profile from './pages/Profile';
import EngineerDashboard from './pages/EngineerDashboard';
import EngineerIssues from './pages/EngineerIssues';
import EngineerPerformance from './pages/EngineerPerformance';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import Analytics from './pages/Analytics';
import MapView from './pages/MapView';
import Settings from './pages/Settings';
import './styles/index.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Restore authentication on app load
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you'd verify the token here
      // For now, we'll just assume it's valid if it exists
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/submit-issue" element={<SubmitIssue />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Admin routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/map"
            element={
              <ProtectedRoute requiredRole="admin">
                <MapView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requiredRole="admin">
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Engineer routes */}
          <Route
            path="/engineer/dashboard"
            element={
              <ProtectedRoute requiredRole="engineer">
                <EngineerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/engineer/issues"
            element={
              <ProtectedRoute requiredRole="engineer">
                <EngineerIssues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/engineer/performance"
            element={
              <ProtectedRoute requiredRole="engineer">
                <EngineerPerformance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/engineer/settings"
            element={
              <ProtectedRoute requiredRole="engineer">
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Surveyor routes */}
          <Route
            path="/surveyor/dashboard"
            element={
              <ProtectedRoute requiredRole="surveyor">
                <SurveyorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/surveyor/report-issue"
            element={
              <ProtectedRoute requiredRole="surveyor">
                <ReportIssue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/surveyor/settings"
            element={
              <ProtectedRoute requiredRole="surveyor">
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/surveyor/issues"
            element={
              <ProtectedRoute requiredRole="surveyor">
                <IssueList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/surveyor/issues/:id"
            element={
              <ProtectedRoute requiredRole="surveyor">
                <IssueDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/surveyor/profile"
            element={
              <ProtectedRoute requiredRole="surveyor">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Common routes */}
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={<Settings />}
          />
        </Route>

        {/* Redirect root based on auth */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={localStorage.getItem('userRole') === 'admin' ? '/dashboard' : '/engineer/dashboard'} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

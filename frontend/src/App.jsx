import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import EngineerDashboard from './pages/EngineerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SurveyorDashboard from './pages/SurveyorDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/engineer" 
        element={
          <ProtectedRoute allowedRoles={['engineer']}>
            <EngineerDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/surveyor" 
        element={
          <ProtectedRoute allowedRoles={['surveyor']}>
            <SurveyorDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/" 
        element={
          user ? (
            user.role === 'engineer' ? <Navigate to="/engineer" /> : 
            user.role === 'admin' ? <Navigate to="/admin" /> :
            user.role === 'surveyor' ? <Navigate to="/surveyor" /> :
            <Navigate to="/login" />
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

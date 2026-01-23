import React from 'react';
import AdminDashboard from '../components/admin/Dashboard';

const AdminDashboardPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Admin Dashboard
      </h1>
      <AdminDashboard />
    </div>
  );
};

export default AdminDashboardPage;

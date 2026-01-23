import React from 'react';
import UserManagement from '../components/admin/UserManagement';

const UserManagementPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        User Management
      </h1>
      <UserManagement />
    </div>
  );
};

export default UserManagementPage;

import React from 'react';
import PerformanceDashboard from '../components/engineer/PerformanceDashboard';

const EngineerPerformancePage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Performance Dashboard
      </h1>
      <PerformanceDashboard />
    </div>
  );
};

export default EngineerPerformancePage;

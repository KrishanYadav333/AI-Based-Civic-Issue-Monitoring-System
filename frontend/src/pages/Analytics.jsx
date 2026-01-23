import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Analytics from '../components/admin/Analytics';
import ReportGenerator from '../components/admin/ReportGenerator';
import { BarChart3, FileText } from 'lucide-react';

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics & Reports
        </h1>
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={18} />
              Analytics
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'reports'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={18} />
              Reports
            </div>
          </button>
        </div>
      </div>

      {/* Analytics Tab */}
      <motion.div
        key="analytics"
        variants={tabVariants}
        initial="hidden"
        animate={activeTab === 'analytics' ? 'visible' : 'hidden'}
        transition={{ duration: 0.3 }}
        className={activeTab === 'analytics' ? 'block' : 'hidden'}
      >
        <Analytics />
      </motion.div>

      {/* Reports Tab */}
      <motion.div
        key="reports"
        variants={tabVariants}
        initial="hidden"
        animate={activeTab === 'reports' ? 'visible' : 'hidden'}
        transition={{ duration: 0.3 }}
        className={activeTab === 'reports' ? 'block' : 'hidden'}
      >
        <ReportGenerator />
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;

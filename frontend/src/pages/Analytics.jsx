import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Analytics from '../components/admin/Analytics';
import ReportGenerator from '../components/admin/ReportGenerator';
import { BarChart3, FileText } from 'lucide-react';
import backgroundImage from '../assets/images/Background_image.jpg';

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Navy blue gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-blue-800/30 to-blue-600/35 pointer-events-none"></div>
      
      <div className="relative z-10 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold metallic-text">
          Analytics & Reports
        </h1>
        <div className="flex gap-2 glass-card-strong rounded-xl p-1 shadow-lg">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={18} />
              Analytics
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                : 'text-white/90 hover:bg-white/10'
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
    </div>
  );
};

export default AnalyticsPage;

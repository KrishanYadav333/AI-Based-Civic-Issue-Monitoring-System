import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchIssues, setSelectedIssue } from '../../store/issueSlice';
import { Card, MetricCard, Button } from '../common/FormElements';
import { LoadingSpinner, CardSkeleton } from '../common/Loaders';
import { CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

// VMC Government Colors
const VMC_COLORS = {
  primary: '#0a2647',
  primaryBlue: '#144272',
  primaryLight: '#205295',
  accent: '#2c74b3',
  orange: '#e67e22',
  green: '#27ae60',
  red: '#e74c3c',
  yellow: '#f39c12',
  purple: '#9b59b6',
  teal: '#1abc9c'
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const EngineerDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { issues, loading } = useSelector(state => state.issues);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch]);

  // Calculate metrics for engineer
  const assignedIssues = issues.filter(issue => issue.assignedTo === user?.id || issue.assignedTo === 'Engineer001');
  const resolvedCount = assignedIssues.filter(issue => issue.status === 'resolved').length;
  const inProgressCount = assignedIssues.filter(issue => issue.status === 'assigned').length;
  const pendingCount = assignedIssues.filter(issue => issue.status === 'pending').length;

  const resolutionRate = assignedIssues.length > 0 
    ? Math.round((resolvedCount / assignedIssues.length) * 100)
    : 0;

  const avgResolutionTime = assignedIssues.length > 0 
    ? Math.round(assignedIssues
        .filter(i => i.resolutionDate && i.createdDate)
        .reduce((acc, i) => {
          const created = new Date(i.createdDate);
          const resolved = new Date(i.resolutionDate);
          return acc + (resolved - created) / (1000 * 60 * 60 * 24);
        }, 0) / resolvedCount)
    : 0;

  if (loading) {
    return <CardSkeleton count={4} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <motion.div variants={headerVariants} initial="hidden" animate="visible">
          <h1 className="text-3xl font-bold text-[#0a2647] mb-2">Engineer Dashboard</h1>
          <p className="text-gray-600 text-sm font-medium">Track your progress and manage assigned issues</p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }}>
            <div className="bg-white rounded-lg border-l-4 border-[#27ae60] p-6 shadow-md hover:shadow-xl transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs font-medium uppercase tracking-wider">Issues Resolved</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{resolvedCount}</p>
                  <p className="text-sm text-gray-500 mt-1">This month</p>
                </div>
                <div className="bg-[#27ae60] p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }}>
            <div className="bg-white rounded-lg border-l-4 border-[#e67e22] p-6 shadow-md hover:shadow-xl transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs font-medium uppercase tracking-wider">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{inProgressCount}</p>
                  <p className="text-sm text-gray-500 mt-1">Active issues</p>
                </div>
                <div className="bg-[#e67e22] p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }}>
            <div className="bg-white rounded-lg border-l-4 border-[#144272] p-6 shadow-md hover:shadow-xl transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs font-medium uppercase tracking-wider">Avg Resolution Time</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{avgResolutionTime === Infinity || isNaN(avgResolutionTime) ? 'N/A' : `${avgResolutionTime}d`}</p>
                  <p className="text-sm text-gray-500 mt-1">Days to resolve</p>
                </div>
                <div className="bg-[#144272] p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }}>
            <div className="bg-white rounded-lg border-l-4 border-[#9b59b6] p-6 shadow-md hover:shadow-xl transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs font-medium uppercase tracking-wider">Resolution Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{resolutionRate}%</p>
                  <p className="text-sm text-gray-500 mt-1">Success rate</p>
                </div>
                <div className="bg-[#9b59b6] p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.01 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6"
        >
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg font-semibold text-[#0a2647] mb-6"
          >
            Issue Breakdown
          </motion.h3>
          <div className="grid grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            whileHover={{ scale: 1.05 }}
            className="text-center cursor-pointer p-4 rounded-lg border border-gray-200 hover:border-[#144272] hover:bg-blue-50 transition-all duration-300"
          >
            <p className="text-3xl font-bold text-[#144272]">{assignedIssues.length}</p>
            <p className="text-sm text-gray-600 mt-1">Total Assigned</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            className="text-center cursor-pointer p-4 rounded-lg border border-gray-200 hover:border-[#e67e22] hover:bg-orange-50 transition-all duration-300"
          >
            <p className="text-3xl font-bold text-[#e67e22]">{inProgressCount}</p>
            <p className="text-sm text-gray-600 mt-1">In Progress</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            whileHover={{ scale: 1.05 }}
            className="text-center cursor-pointer p-4 rounded-lg border border-gray-200 hover:border-[#27ae60] hover:bg-green-50 transition-all duration-300"
          >
            <p className="text-3xl font-bold text-[#27ae60]">{resolvedCount}</p>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6"
      >
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg font-semibold text-[#0a2647] mb-4"
          >
            Recent Issues
          </motion.h3>
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.08, delayChildren: 0.55 }}
        >
          {assignedIssues.slice(0, 5).map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="flex items-start justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{issue.title}</p>
                <p className="text-xs text-gray-500 mt-1">{issue.ward}</p>
              </div>
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.55 + index * 0.08, type: 'spring', stiffness: 200 }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  issue.status === 'resolved' ? 'bg-green-100 text-green-800 border border-green-300' :
                  issue.status === 'assigned' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                  'bg-blue-100 text-blue-800 border border-blue-300'
                }`}
              >
                {issue.status}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
};

export default EngineerDashboard;

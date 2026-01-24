import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues, setSelectedIssue } from '../../store/issueSlice';
import { Card, MetricCard, Button } from '../common/FormElements';
import { LoadingSpinner, CardSkeleton } from '../common/Loaders';
import { CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import backgroundImage from '../../assets/images/Background_image.jpg';

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
      
      <div className="relative z-10 p-8 space-y-6">
      {/* Header */}
      <motion.div variants={headerVariants} initial="hidden" animate="visible">
        <h1 className="text-4xl font-bold metallic-text mb-2">Your Performance</h1>
        <p className="text-white/80 text-sm font-medium">Track your progress and manage assigned issues</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.3 } }}>
          <div className="glass-card-strong rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white/90 text-xs font-semibold uppercase tracking-wider">Issues Resolved</p>
                <p className="text-3xl font-bold text-white mt-2">{resolvedCount}</p>
                <p className="text-sm text-white/70 mt-1">This month</p>
              </div>
              <div className="bg-emerald-500/30 p-3 rounded-xl backdrop-blur-sm">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.3 } }}>
          <div className="glass-card-strong rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white/90 text-xs font-semibold uppercase tracking-wider">In Progress</p>
                <p className="text-3xl font-bold text-white mt-2">{inProgressCount}</p>
                <p className="text-sm text-white/70 mt-1">Active issues</p>
              </div>
              <div className="bg-orange-500/30 p-3 rounded-xl backdrop-blur-sm">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.3 } }}>
          <div className="glass-card-strong rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white/90 text-xs font-semibold uppercase tracking-wider">Avg Resolution Time</p>
                <p className="text-3xl font-bold text-white mt-2">{avgResolutionTime === Infinity || isNaN(avgResolutionTime) ? 'N/A' : `${avgResolutionTime}d`}</p>
                <p className="text-sm text-white/70 mt-1">Days to resolve</p>
              </div>
              <div className="bg-blue-500/30 p-3 rounded-xl backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.3 } }}>
          <div className="glass-card-strong rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white/90 text-xs font-semibold uppercase tracking-wider">Resolution Rate</p>
                <p className="text-3xl font-bold text-white mt-2">{resolutionRate}%</p>
                <p className="text-sm text-white/70 mt-1">Success rate</p>
              </div>
              <div className="bg-purple-500/30 p-3 rounded-xl backdrop-blur-sm">
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
        whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="glass-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6"
      >
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg font-semibold text-white mb-6"
          >
            Issue Breakdown
          </motion.h3>
          <div className="grid grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            whileHover={{ scale: 1.05 }}
            className="text-center cursor-pointer p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
          >
            <p className="text-3xl font-bold text-blue-300">{assignedIssues.length}</p>
            <p className="text-sm text-white/80 mt-1">Total Assigned</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            className="text-center cursor-pointer p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
          >
            <p className="text-3xl font-bold text-orange-300">{inProgressCount}</p>
            <p className="text-sm text-white/80 mt-1">In Progress</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            whileHover={{ scale: 1.05 }}
            className="text-center cursor-pointer p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
          >
            <p className="text-3xl font-bold text-green-300">{resolvedCount}</p>
            <p className="text-sm text-white/80 mt-1">Completed</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="glass-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6"
      >
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg font-semibold text-white mb-4"
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
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="flex items-start justify-between p-4 border border-white/20 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
              <div className="flex-1">
                <p className="font-semibold text-white">{issue.title}</p>
                <p className="text-xs text-white/70 mt-1">{issue.ward}</p>
              </div>
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.55 + index * 0.08, type: 'spring', stiffness: 200 }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm ${
                  issue.status === 'resolved' ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30' :
                  issue.status === 'assigned' ? 'bg-orange-500/30 text-orange-200 border border-orange-400/30' :
                  'bg-blue-500/30 text-blue-200 border border-blue-400/30'
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

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues, setSelectedIssue } from '../../store/issueSlice';
import { Card, MetricCard, Button } from '../common/FormElements';
import { LoadingSpinner, CardSkeleton } from '../common/Loaders';
import { CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={headerVariants} initial="hidden" animate="visible">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Performance</h2>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <MetricCard
            label="Issues Resolved"
            value={resolvedCount}
            subtext="This month"
            icon={CheckCircle}
            color="success"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            label="In Progress"
            value={inProgressCount}
            subtext="Active issues"
            icon={Clock}
            color="warning"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            label="Avg Resolution Time"
            value={`${avgResolutionTime}d`}
            subtext="Days to resolve"
            icon={TrendingUp}
            color="primary"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MetricCard
            label="Resolution Rate"
            value={`${resolutionRate}%`}
            subtext="Success rate"
            icon={TrendingUp}
            color="primary"
          />
        </motion.div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card>
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg font-semibold text-gray-900 mb-4"
          >
            Issue Breakdown
          </motion.h3>
          <div className="grid grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            whileHover={{ scale: 1.05 }}
            className="text-center cursor-pointer"
          >
            <p className="text-2xl font-bold text-blue-600">{assignedIssues.length}</p>
            <p className="text-sm text-gray-600">Total Assigned</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            className="text-center cursor-pointer"
          >
            <p className="text-2xl font-bold text-orange-600">{inProgressCount}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            whileHover={{ scale: 1.05 }}
            className="text-center cursor-pointer"
          >
            <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </motion.div>
        </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card>
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg font-semibold text-gray-900 mb-4"
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
              whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{issue.title}</p>
                <p className="text-xs text-gray-500">{issue.ward}</p>
              </div>
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.55 + index * 0.08, type: 'spring', stiffness: 200 }}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  issue.status === 'assigned' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {issue.status}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </Card>
      </motion.div>
    </div>
  );
};

export default EngineerDashboard;

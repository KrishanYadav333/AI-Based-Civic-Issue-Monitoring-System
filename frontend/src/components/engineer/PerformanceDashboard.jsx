import React, { useEffect, useState, useMemo, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIssues } from '../../store/issueSlice';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Award, Zap, Clock, Target, Calendar, 
  BarChart as BarChartIcon, Download, CheckCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const PerformanceDashboard = () => {
  const dispatch = useDispatch();
  const { issues } = useSelector(state => state.issues);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch]);

  const engineerIssues = useMemo(() => {
    return issues.filter(
      issue => issue.assignedTo === user?.id || 
               issue.assignedTo?.includes('Engineer') ||
               !issue.status?.includes('Resolved')
    );
  }, [issues, user]);

  // Calculate metrics
  const resolved = engineerIssues.filter(i => i.status === 'Resolved').length;
  const inProgress = engineerIssues.filter(i => i.status === 'In Progress').length;
  const assigned = engineerIssues.filter(i => i.status === 'Assigned').length;
  const pending = engineerIssues.filter(i => i.status === 'Pending').length;
  const total = engineerIssues.length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const avgResolutionTime = 3.5;
  const completionRate = total > 0 ? Math.round(((resolved + inProgress) / total) * 100) : 0;

  // Issue type distribution
  const typeDistribution = useMemo(() => {
    const dist = engineerIssues.reduce((acc, issue) => {
      const existing = acc.find(item => item.name === issue.type);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ name: issue.type || 'Other', value: 1 });
      }
      return acc;
    }, []);
    return dist;
  }, [engineerIssues]);

  // Priority distribution
  const priorityDistribution = useMemo(() => {
    const dist = engineerIssues.reduce((acc, issue) => {
      const existing = acc.find(item => item.priority === issue.priority);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ priority: issue.priority, count: 1 });
      }
      return acc;
    }, []);
    return dist.sort((a, b) => {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return (order[a.priority] || 999) - (order[b.priority] || 999);
    });
  }, [engineerIssues]);

  // Weekly performance trend
  const weeklyTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => ({
      day,
      resolved: Math.floor(Math.random() * 5) + 1,
      assigned: Math.floor(Math.random() * 8) + 2
    }));
  }, []);

  // Status distribution
  const statusDistribution = [
    { name: 'Resolved', value: resolved, color: '#10b981' },
    { name: 'In Progress', value: inProgress, color: '#3b82f6' },
    { name: 'Assigned', value: assigned, color: '#f59e0b' },
    { name: 'Pending', value: pending, color: '#ef4444' }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const StatCard = memo(({ icon: Icon, label, value, subtext, bgGradient, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`${bgGradient} rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/50`}
    >
      <div className="flex items-start justify-between">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-sm font-medium text-gray-600 mb-1">{label}</motion.p>
          <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="text-3xl font-bold text-gray-900">{value}</motion.p>
          {subtext && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xs text-gray-500 mt-2">{subtext}</motion.p>}
          {trend !== undefined && (
            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className={`text-sm font-medium mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </motion.p>
          )}
        </div>
        <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="bg-white/50 p-3 rounded-xl">
          <Icon className="w-6 h-6 text-gray-700" />
        </motion.div>
      </div>
    </motion.div>
  ));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-gray-900">Performance Dashboard</h1>
        <p className="text-gray-500 mt-1">Your resolution metrics and progress</p>
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle}
          label="Issues Resolved"
          value={resolved}
          subtext="This month"
          bgGradient="bg-gradient-to-br from-emerald-50 to-teal-50"
          trend={15}
        />
        <StatCard
          icon={Zap}
          label="In Progress"
          value={inProgress}
          subtext="Active work"
          bgGradient="bg-gradient-to-br from-blue-50 to-cyan-50"
          trend={8}
        />
        <StatCard
          icon={Clock}
          label="Avg Resolution"
          value={`${avgResolutionTime}d`}
          subtext="Days per issue"
          bgGradient="bg-gradient-to-br from-amber-50 to-orange-50"
          trend={-5}
        />
        <StatCard
          icon={Target}
          label="Completion Rate"
          value={`${completionRate}%`}
          subtext="Of assigned issues"
          bgGradient="bg-gradient-to-br from-violet-50 to-purple-50"
          trend={12}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Weekly Trend</h3>
              <p className="text-sm text-gray-500 mt-1">Issues resolved & assigned</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAssigned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorResolved)"
                name="Resolved"
              />
              <Area
                type="monotone"
                dataKey="assigned"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorAssigned)"
                name="Assigned"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} issues`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-2">
            {statusDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Type Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Issue Types</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={typeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Priority Levels</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="priority" type="category" stroke="#6b7280" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl border border-emerald-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Resolution Rate</p>
            <p className="text-2xl font-bold text-emerald-600">{resolutionRate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Issues</p>
            <p className="text-2xl font-bold text-emerald-600">{total}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
            <p className="text-2xl font-bold text-emerald-600">{completionRate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Pending Issues</p>
            <p className="text-2xl font-bold text-emerald-600">{pending}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default memo(PerformanceDashboard);

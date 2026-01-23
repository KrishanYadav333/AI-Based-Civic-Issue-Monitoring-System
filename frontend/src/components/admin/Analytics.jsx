import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues } from '../../store/issueSlice';
import { Card, Button } from '../common/FormElements';
import { Download, BarChart3, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { exportToCSV } from '../../utils/helpers';
import { motion } from 'framer-motion';

// Animation variants
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

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

const chartVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Analytics = () => {
  const dispatch = useDispatch();
  const { issues } = useSelector(state => state.issues);

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch]);

  // Ward performance data
  const wardData = useMemo(() => issues.reduce((acc, issue) => {
    const existing = acc.find(item => item.ward === issue.ward);
    if (existing) {
      existing.total++;
      if (issue.status === 'Resolved') existing.resolved++;
      if (issue.priority === 'Critical') existing.critical++;
    } else {
      acc.push({
        ward: issue.ward,
        total: 1,
        resolved: issue.status === 'Resolved' ? 1 : 0,
        critical: issue.priority === 'Critical' ? 1 : 0,
      });
    }
    return acc;
  }, []), [issues]);

  // Issue trend data (mock)
  const trendData = [
    { date: 'Week 1', issues: 8, resolved: 5 },
    { date: 'Week 2', issues: 12, resolved: 7 },
    { date: 'Week 3', issues: 15, resolved: 9 },
    { date: 'Week 4', issues: 18, resolved: 12 },
  ];

  // Department breakdown
  const typeData = useMemo(() => {
    const data = issues.reduce((acc, issue) => {
      const existing = acc.find(item => item.name === issue.type);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ name: issue.type, value: 1 });
      }
      return acc;
    }, []);
    return data.sort((a, b) => b.value - a.value);
  }, [issues]);

  const typeColors = {
    'Road Damage': '#3b82f6',
    'Infrastructure': '#10b981',
    'Water Leakage': '#f59e0b',
    'Garbage': '#ef4444',
    'Traffic Control': '#8b5cf6',
    'Obstruction': '#ec4899',
    'Graffiti': '#14b8a6',
    'Water Quality': '#f97316',
    'Pollution': '#06b6d4',
    'Health Hazard': '#84cc16',
    'Streetlight': '#0ea5e9',
    'Noise Pollution': '#d946ef',
    'Vegetation': '#f43f5e',
  };

  const COLORS = Object.values(typeColors);

  // Priority breakdown
  const priorityData = [
    { name: 'Critical', value: issues.filter(i => i.priority === 'Critical').length, color: '#ef4444' },
    { name: 'High', value: issues.filter(i => i.priority === 'High').length, color: '#f97316' },
    { name: 'Medium', value: issues.filter(i => i.priority === 'Medium').length, color: '#eab308' },
    { name: 'Low', value: issues.filter(i => i.priority === 'Low').length, color: '#22c55e' },
  ];

  // Status breakdown
  const statusData = [
    { name: 'Pending', value: issues.filter(i => i.status === 'Pending').length, color: '#6b7280' },
    { name: 'Assigned', value: issues.filter(i => i.status === 'Assigned').length, color: '#f59e0b' },
    { name: 'In Progress', value: issues.filter(i => i.status === 'In Progress').length, color: '#3b82f6' },
    { name: 'Resolved', value: issues.filter(i => i.status === 'Resolved').length, color: '#10b981' },
  ];

  // Calculate metrics
  const metrics = useMemo(() => {
    const resolved = issues.filter(i => i.status === 'Resolved').length;
    const total = issues.length;
    const avgResolutionTime = 4.2;
    const criticalCount = issues.filter(i => i.priority === 'Critical').length;
    
    return {
      totalIssues: total,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      avgResolutionTime,
      criticalIssues: criticalCount,
      wardCount: new Set(issues.map(i => i.ward)).size,
    };
  }, [issues]);

  const handleExportCSV = () => {
    const csvData = issues.map(issue => ({
      id: issue.id,
      title: issue.title,
      type: issue.type,
      priority: issue.priority,
      status: issue.status,
      ward: issue.ward,
      createdDate: issue.createdAt,
    }));
    exportToCSV(csvData, 'issues_report');
  };

  const StatCard = ({ label, value, trend, icon: Icon, color }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(trend)}% from last period
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={headerVariants} initial="hidden" animate="visible">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
              <p className="text-gray-600 text-sm">Comprehensive insights and performance metrics</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleExportCSV} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatCard icon={BarChart3} label="Total Issues" value={metrics.totalIssues} trend={12} color="bg-blue-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={TrendingUp} label="Resolution Rate" value={`${metrics.resolutionRate}%`} trend={8} color="bg-green-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={TrendingDown} label="Avg Time (Days)" value={metrics.avgResolutionTime} trend={-5} color="bg-purple-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={BarChart3} label="Critical Issues" value={metrics.criticalIssues} trend={-3} color="bg-red-600" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={BarChart3} label="Wards Covered" value={metrics.wardCount} trend={2} color="bg-orange-600" />
        </motion.div>
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Type Distribution */}
        <motion.div variants={chartVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="bg-white rounded-lg border border-gray-200 p-6">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-semibold text-gray-900 mb-4"
          >
            Issue Type Distribution
          </motion.h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name} (${value})`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {typeData.map((entry, index) => {
                  const color = typeColors[entry.name] || COLORS[index % COLORS.length];
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Pie>
              <Tooltip formatter={(value) => `${value} issues`} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Priority Breakdown */}
        <motion.div variants={chartVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="bg-white rounded-lg border border-gray-200 p-6">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg font-semibold text-gray-900 mb-4"
          >
            Priority Breakdown
          </motion.h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#6b7280', fontSize: 12 }} width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#3b82f6">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line */}
        <motion.div variants={chartVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="bg-white rounded-lg border border-gray-200 p-6">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg font-semibold text-gray-900 mb-4"
          >
            Issues Trend
          </motion.h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="issues" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} name="Issues Reported" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} name="Issues Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Distribution */}
        <motion.div variants={chartVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="bg-white rounded-lg border border-gray-200 p-6">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg font-semibold text-gray-900 mb-4"
          >
            Status Distribution
          </motion.h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#3b82f6">
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Ward Performance */}
      <motion.div variants={chartVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }} className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ward Performance Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={wardData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="ward" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="total" fill="#3b82f6" name="Total Issues" radius={[8, 8, 0, 0]} />
            <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[8, 8, 0, 0]} />
            <Bar dataKey="critical" fill="#ef4444" name="Critical" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Summary Statistics */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 text-sm">Highest Priority Type</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {typeData.length > 0 ? typeData[0].name : 'N/A'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {typeData.length > 0 ? `${typeData[0].value} issues` : ''}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Most Issues Ward</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {wardData.length > 0 ? wardData.reduce((a, b) => a.total > b.total ? a : b).ward : 'N/A'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {wardData.length > 0 ? `${wardData.reduce((a, b) => a.total > b.total ? a : b).total} issues` : ''}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Pending Action</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {issues.filter(i => i.status === 'Pending').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Issues awaiting assignment</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;

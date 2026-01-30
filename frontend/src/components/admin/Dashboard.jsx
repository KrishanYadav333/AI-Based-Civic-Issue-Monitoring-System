import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchIssues } from '../../store/issueSlice';
import { fetchUsers } from '../../store/analyticsSlice';
import { analyticsService } from '../../services/api';
import { CardSkeleton } from '../common/Loaders';
import { FileText, AlertCircle, CheckCircle, Clock, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// VMC Government Colors
const VMC_COLORS = {
  primary: '#003366',
  primaryBlue: '#0056b3',
  primaryLight: '#0066cc',
  accent: '#0077dd',
  orange: '#ff6b35',
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
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { issues, loading } = useSelector(state => state.issues);
  const { users } = useSelector(state => state.users);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchIssues());
    dispatch(fetchUsers());
    
    // Fetch dashboard stats
    analyticsService.getDashboardStats()
      .then(response => {
        setDashboardStats(response.data || response);
        setStatsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching dashboard stats:', error);
        setStatsLoading(false);
      });
  }, [dispatch]);

  // Calculate metrics
  const totalIssues = issues.length;
  const pendingIssues = issues.filter(i => i.status === 'Pending').length;
  const assignedIssues = issues.filter(i => i.status === 'Assigned').length;
  const inProgressIssues = issues.filter(i => i.status === 'In Progress').length;
  const resolvedIssues = issues.filter(i => i.status === 'Resolved').length;
  const criticalIssues = issues.filter(i => i.priority === 'Critical').length;
  const highIssues = issues.filter(i => i.priority === 'High').length;

  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
  const avgResolutionTime = 4.2;
  const prevResolutionRate = 65;
  const resolutionTrend = resolutionRate - prevResolutionRate;

  if (loading || statsLoading) {
    return <CardSkeleton count={6} />;
  }

  // Chart data with VMC colors
  const priorityData = [
    { name: 'Critical', value: criticalIssues, color: VMC_COLORS.red },
    { name: 'High', value: highIssues, color: VMC_COLORS.orange },
    { name: 'Medium', value: issues.filter(i => i.priority === 'Medium').length, color: VMC_COLORS.yellow },
    { name: 'Low', value: issues.filter(i => i.priority === 'Low').length, color: VMC_COLORS.green },
  ];

  const statusData = [
    { name: 'Pending', value: pendingIssues },
    { name: 'Assigned', value: assignedIssues },
    { name: 'In Progress', value: inProgressIssues },
    { name: 'Resolved', value: resolvedIssues },
  ];

  // Calculate trend data from last 7 days of actual issues
  const trendData = React.useMemo(() => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayIssues = issues.filter(issue => {
        const createdAt = new Date(issue.created_at || issue.createdAt);
        return createdAt >= dayStart && createdAt <= dayEnd;
      });
      
      const dayResolved = dayIssues.filter(issue => 
        issue.status === 'Resolved' || issue.status === 'resolved'
      );

      return {
        day: daysOfWeek[date.getDay()],
        issues: dayIssues.length,
        resolved: dayResolved.length
      };
    });
  }, [issues]);

  const recentIssues = [...issues].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  const StatCard = ({ icon: Icon, label, value, trend, borderColor, bgColor }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg p-6 shadow-md border-l-4 ${borderColor} hover:shadow-xl transition-all`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(trend)}% from last week
            </div>
          )}
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-6 md:p-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-[#0a2647]">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1 font-medium">System overview and key metrics</p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
        <motion.div variants={itemVariants}>
          <StatCard icon={FileText} label="Total Issues" value={totalIssues} trend={12} borderColor="border-[#144272]" bgColor="bg-[#144272]" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={Clock} label="Pending Issues" value={pendingIssues} trend={-8} borderColor="border-[#e67e22]" bgColor="bg-[#e67e22]" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={CheckCircle} label="Resolved" value={resolvedIssues} trend={15} borderColor="border-[#27ae60]" bgColor="bg-[#27ae60]" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={AlertCircle} label="Critical" value={criticalIssues} trend={-5} borderColor="border-[#e74c3c]" bgColor="bg-[#e74c3c]" />
        </motion.div>
      </motion.div>

      {/* Charts Grid */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Priority Distribution */}
        <motion.div 
          variants={chartVariants} 
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all"
        >
          <div className="">
            <h3 className="text-lg font-semibold text-[#0a2647] mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} issues`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {priorityData.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                    whileHover={{ scale: 1.3 }}
                  ></motion.div>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value}</span>
              </motion.div>
            ))}
          </div>
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.15, duration: 0.5 }} 
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all"
        >
          <h3 className="text-lg font-semibold text-[#0a2647] mb-4">Status Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#144272" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Key Metrics Cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.03, x: 4 }}
            className="bg-white rounded-lg border-l-4 border-[#27ae60] p-6 shadow-md hover:shadow-xl transition-all"
          >
            <p className="text-gray-600 text-sm font-medium">Resolution Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{resolutionRate}%</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600 font-medium">
              <ArrowUpRight className="w-4 h-4" />
              {resolutionTrend}% improvement
            </div>
          </motion.div>
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.03, x: 4 }}
            className="bg-white rounded-lg border-l-4 border-[#144272] p-6 shadow-md hover:shadow-xl transition-all"
          >
            <p className="text-gray-600 text-sm font-medium">Avg Resolution Time</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{avgResolutionTime}</p>
            <p className="text-xs text-gray-500 mt-2">Days on average</p>
          </motion.div>
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.03, x: 4 }}
            className="bg-white rounded-lg border-l-4 border-[#9b59b6] p-6 shadow-md hover:shadow-xl transition-all"
          >
            <p className="text-gray-600 text-sm font-medium">Active Engineers</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{users.filter(u => u.role === 'engineer').length}</p>
            <p className="text-xs text-gray-500 mt-2">Currently assigned</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
        whileHover={{ scale: 1.01 }}
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all"
      >
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="text-lg font-semibold text-[#0a2647] mb-4"
        >
          Weekly Trend
        </motion.h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="issues" stroke="#144272" strokeWidth={2} dot={{ fill: '#144272', r: 4 }} name="Reported" />
            <Line type="monotone" dataKey="resolved" stroke="#27ae60" strokeWidth={2} dot={{ fill: '#27ae60', r: 4 }} name="Resolved" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        whileHover={{ scale: 1.01 }}
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all"
      >
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-lg font-semibold text-[#0a2647] mb-4"
        >
          Recent Activity
        </motion.h3>
        <div className="space-y-3">
          {recentIssues.map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.4 + index * 0.08, duration: 0.5, ease: 'easeOut' }}
              whileHover={{ x: 4, scale: 1.01 }}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200"
            >
              <div className="flex-1">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + index * 0.08 }}
                  className="font-semibold text-gray-900 text-sm"
                >
                  {issue.title}
                </motion.p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>{issue.ward}</span>
                  <span>•</span>
                  <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.08, duration: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    issue.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                    issue.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    issue.status === 'Assigned' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}
                >
                  {issue.status}
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + index * 0.08, duration: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                  className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                    issue.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                    issue.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}
                >
                  {issue.priority}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;

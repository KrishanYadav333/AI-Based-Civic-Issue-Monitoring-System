import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues } from '../../store/issueSlice';
import { fetchUsers } from '../../store/analyticsSlice';
import { CardSkeleton } from '../common/Loaders';
import { FileText, AlertCircle, CheckCircle, Clock, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import backgroundImage from '../../assets/images/Background_image.jpg';

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

  useEffect(() => {
    dispatch(fetchIssues());
    dispatch(fetchUsers());
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

  if (loading) {
    return <CardSkeleton count={6} />;
  }

  // Chart data
  const priorityData = [
    { name: 'Critical', value: criticalIssues, color: '#ef4444' },
    { name: 'High', value: highIssues, color: '#f97316' },
    { name: 'Medium', value: issues.filter(i => i.priority === 'Medium').length, color: '#eab308' },
    { name: 'Low', value: issues.filter(i => i.priority === 'Low').length, color: '#22c55e' },
  ];

  const statusData = [
    { name: 'Pending', value: pendingIssues },
    { name: 'Assigned', value: assignedIssues },
    { name: 'In Progress', value: inProgressIssues },
    { name: 'Resolved', value: resolvedIssues },
  ];

  const trendData = [
    { day: 'Mon', issues: 12, resolved: 8 },
    { day: 'Tue', issues: 15, resolved: 10 },
    { day: 'Wed', issues: 14, resolved: 12 },
    { day: 'Thu', issues: 18, resolved: 14 },
    { day: 'Fri', issues: 22, resolved: 16 },
    { day: 'Sat', issues: 19, resolved: 18 },
    { day: 'Sun', issues: 16, resolved: 15 },
  ];

  const recentIssues = [...issues].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  const StatCard = ({ icon: Icon, label, value, trend, bgGradient, iconBg }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-card-strong rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/90 text-sm font-semibold transition-colors duration-300">{label}</p>
          <p className="text-4xl font-bold text-white mt-2 transition-all duration-300">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium transition-all duration-300 ${trend >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {trend >= 0 ? <ArrowUpRight className="w-4 h-4 transition-transform duration-300" /> : <ArrowDownRight className="w-4 h-4 transition-transform duration-300" />}
              {Math.abs(trend)}% from last week
            </div>
          )}
        </div>
        <div className={`${iconBg} p-3 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-110`}>
          <Icon className="w-6 h-6 text-white transition-transform duration-300 hover:rotate-12" />
        </div>
      </div>
    </motion.div>
  );

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
      
      <div className="relative z-10 space-y-6 p-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold metallic-text">Dashboard</h1>
          <p className="text-white/80 mt-1 font-medium">System overview and key metrics</p>
        </motion.div>

      {/* KPI Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatCard icon={FileText} label="Total Issues" value={totalIssues} trend={12} iconBg="bg-blue-500/30" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={Clock} label="Pending Issues" value={pendingIssues} trend={-8} iconBg="bg-orange-500/30" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={CheckCircle} label="Resolved" value={resolvedIssues} trend={15} iconBg="bg-emerald-500/30" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={AlertCircle} label="Critical" value={criticalIssues} trend={-5} iconBg="bg-red-500/30" />
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
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          className="glass-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 transition-colors duration-300">Priority Distribution</h3>
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
                whileHover={{ x: 8, transition: { duration: 0.2 } }}
                className="flex items-center justify-between text-sm transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="w-3 h-3 rounded-full transition-all duration-300" 
                    style={{ backgroundColor: item.color }}
                    whileHover={{ scale: 1.5 }}
                  ></motion.div>
                  <span className="text-white/90 transition-colors duration-300">{item.name}</span>
                </div>
                <span className="font-semibold text-white transition-all duration-300">{item.value}</span>
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
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          className="glass-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 transition-colors duration-300">Status Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Key Metrics Cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.05, x: 8, transition: { duration: 0.3 } }}
            className="glass-card-light rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
          >
            <p className="text-emerald-300 text-sm font-semibold transition-colors duration-300">Resolution Rate</p>
            <p className="text-4xl font-bold text-white mt-2 transition-all duration-300">{resolutionRate}%</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-emerald-300 font-medium transition-all duration-300">
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300" />
              {resolutionTrend}% improvement
            </div>
          </motion.div>
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.05, x: 8, transition: { duration: 0.3 } }}
            className="glass-card-light rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
          >
            <p className="text-blue-300 text-sm font-semibold transition-colors duration-300">Avg Resolution Time</p>
            <p className="text-4xl font-bold text-white mt-2 transition-all duration-300">{avgResolutionTime}</p>
            <p className="text-xs text-blue-200 mt-2 transition-colors duration-300">Days on average</p>
          </motion.div>
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.05, x: 8, transition: { duration: 0.3 } }}
            className="glass-card-light rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
          >
            <p className="text-purple-300 text-sm font-semibold transition-colors duration-300">Active Engineers</p>
            <p className="text-4xl font-bold text-white mt-2 transition-all duration-300">{users.filter(u => u.role === 'engineer').length}</p>
            <p className="text-xs text-purple-200 mt-2 transition-colors duration-300">Currently assigned</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
        whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
        className="glass-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6"
      >
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="text-lg font-semibold text-white mb-4 transition-colors duration-300"
        >
          Weekly Trend
        </motion.h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
            <Line type="monotone" dataKey="issues" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="Reported" />
            <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} name="Resolved" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
        className="glass-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6"
      >
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-lg font-semibold text-white mb-4 transition-colors duration-300"
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
              whileHover={{ x: 12, scale: 1.02, boxShadow: '0 8px 20px rgba(12,30,63,0.4)', transition: { duration: 0.3 } }}
              className="flex items-center justify-between p-4 rounded-xl glass-card-light hover:glass-card transition-all duration-500 cursor-pointer"
            >
              <div className="flex-1">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + index * 0.08 }}
                  className="font-semibold text-white text-sm"
                >
                  {issue.title}
                </motion.p>
                <div className="flex items-center gap-4 mt-1 text-xs text-white/70">
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
                  whileHover={{ scale: 1.15, transition: { duration: 0.2 } }}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                    issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
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
                  whileHover={{ scale: 1.15, transition: { duration: 0.2 } }}
                  className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-all duration-300 ${
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

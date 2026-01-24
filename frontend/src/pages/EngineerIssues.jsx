import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues, setSelectedIssue, setFilters, setSearchQuery } from '../store/issueSlice';
import { motion } from 'framer-motion';
import { 
  Search, Filter, ArrowUpDown, Eye, Clock, AlertCircle, X, 
  ChevronDown, MapPin, Calendar, CheckCircle, MoreVertical, Download,
  BarChart3, ClipboardList, RefreshCw
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../components/common/Badges';
import { LoadingSpinner, CardSkeleton } from '../components/common/Loaders';
import IssueDetailPanel from '../components/engineer/IssueDetailPanel';
import { filterIssues, sortIssues, formatDate } from '../utils/helpers';
import backgroundImage from '../assets/images/Background_image.jpg';

export default function EngineerIssuesPage() {
  const dispatch = useDispatch();
  const { issues, loading, selectedIssue } = useSelector(state => state.issues);
  const user = useSelector(state => state.auth.user);
  
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({});

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch]);

  // Filter issues assigned to engineer
  const engineerIssues = useMemo(() => {
    return issues.filter(issue => 
      issue.assignedTo === user?.id || 
      issue.assignedTo?.includes('Engineer') ||
      !issue.status?.includes('Resolved')
    );
  }, [issues, user]);

  // Get unique values for dropdowns
  const wards = useMemo(() => [...new Set(issues.map(i => i.ward))].filter(Boolean), [issues]);
  const types = useMemo(() => [...new Set(issues.map(i => i.type))].filter(Boolean), [issues]);
  const statuses = useMemo(() => [...new Set(issues.map(i => i.status))].filter(Boolean), [issues]);
  const priorities = useMemo(() => [...new Set(issues.map(i => i.priority))].filter(Boolean), [issues]);

  // Apply all filters
  const filteredIssues = useMemo(() => {
    let filtered = engineerIssues.filter(issue => {
      const matchesSearch = issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           issue.id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
      const matchesType = typeFilter === 'all' || issue.type === typeFilter;
      const matchesWard = wardFilter === 'all' || issue.ward === wardFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesWard;
    });
    
    return sortIssues(filtered, sortBy);
  }, [engineerIssues, searchQuery, statusFilter, priorityFilter, typeFilter, wardFilter, sortBy]);

  const handleSelectIssue = (issue) => {
    dispatch(setSelectedIssue(issue));
    setDetailPanelOpen(true);
  };

  // Stats
  const stats = {
    total: engineerIssues.length,
    pending: engineerIssues.filter(i => i.status === 'Pending').length,
    assigned: engineerIssues.filter(i => i.status === 'Assigned').length,
    inProgress: engineerIssues.filter(i => i.status === 'In Progress').length,
  };

  if (loading) {
    return <CardSkeleton count={5} />;
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
      
      <div className="relative z-10">
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold metallic-text">My Issues</h1>
              <p className="text-white mt-2 text-base font-semibold drop-shadow-lg">Track and manage your assigned civic issues</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats.total, Icon: BarChart3, gradient: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-400/30', text: 'text-blue-200' },
              { label: 'Pending', value: stats.pending, Icon: Clock, gradient: 'from-orange-500/20 to-orange-600/20', border: 'border-orange-400/30', text: 'text-orange-200' },
              { label: 'Assigned', value: stats.assigned, Icon: ClipboardList, gradient: 'from-cyan-500/20 to-cyan-600/20', border: 'border-cyan-400/30', text: 'text-cyan-200' },
              { label: 'In Progress', value: stats.inProgress, Icon: RefreshCw, gradient: 'from-emerald-500/20 to-emerald-600/20', border: 'border-emerald-400/30', text: 'text-emerald-200' }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.3 } }}
                transition={{ delay: i * 0.08 }}
                className={`glass-card-strong rounded-2xl p-6 border ${stat.border} shadow-lg hover:shadow-2xl transition-all duration-500`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-2">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.text}`}>{stat.value}</p>
                  </div>
                  <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl backdrop-blur-sm`}>
                    <stat.Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search & Filter Bar */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
            transition={{ delay: 0.2 }} 
            className="glass-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6"
          >
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search issues by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/50 transition-all backdrop-blur-sm"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    showFilters
                      ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30'
                      : 'bg-white/10 text-white/90 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                <div className="flex gap-2 sm:ml-auto">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-2.5 rounded-lg font-medium transition-all duration-300 ${viewMode === 'table' ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30' : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'}`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`px-3 py-2.5 rounded-lg font-medium transition-all duration-300 ${viewMode === 'card' ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30' : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'}`}
                  >
                    Cards
                  </button>
                </div>
              </div>

              {/* Expandable Filters */}
              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white text-sm backdrop-blur-sm"
                    >
                      <option value="all" className="bg-gray-800">All Status</option>
                      <option value="Pending" className="bg-gray-800">Pending</option>
                      <option value="Assigned" className="bg-gray-800">Assigned</option>
                      <option value="In Progress" className="bg-gray-800">In Progress</option>
                      <option value="Resolved" className="bg-gray-800">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Priority</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white text-sm backdrop-blur-sm"
                    >
                      <option value="all" className="bg-gray-800">All Priority</option>
                      <option value="Critical" className="bg-gray-800">Critical</option>
                      <option value="High" className="bg-gray-800">High</option>
                      <option value="Medium" className="bg-gray-800">Medium</option>
                      <option value="Low" className="bg-gray-800">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white text-sm backdrop-blur-sm"
                    >
                      <option value="date" className="bg-gray-800">Newest First</option>
                      <option value="priority" className="bg-gray-800">Priority</option>
                      <option value="status" className="bg-gray-800">Status</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Content View - Table or Cards */}
          {filteredIssues.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-12 text-center shadow-lg">
              <AlertCircle className="w-12 h-12 text-white/60 mx-auto mb-4" />
              <p className="text-white font-semibold text-lg">No issues found</p>
              <p className="text-white/70 text-sm mt-1">Try adjusting your filters or search</p>
            </motion.div>
          ) : viewMode === 'table' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">Issue</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">Ward</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">Date</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white/90">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredIssues.map((issue, idx) => (
                    <motion.tr
                      key={issue.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      transition={{ delay: 0.2 + idx * 0.08, duration: 0.4 }}
                      className="hover:bg-white/10 transition-all duration-300"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-white text-sm">{issue.title}</p>
                          <p className="text-white/70 text-xs mt-0.5">{issue.description?.substring(0, 50)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4"><PriorityBadge priority={issue.priority} /></td>
                      <td className="px-6 py-4"><StatusBadge status={issue.status} /></td>
                      <td className="px-6 py-4 text-sm text-white/80">{issue.ward}</td>
                      <td className="px-6 py-4 text-sm text-white/80">{formatDate(issue.createdAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSelectIssue(issue)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/30 text-blue-200 hover:bg-blue-500/40 font-medium transition-all duration-300 border border-blue-400/30"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.08, delayChildren: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredIssues.map((issue, idx) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                  className="glass-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="p-5 border-b border-white/20">
                    <motion.h3 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + idx * 0.08 }}
                      className="font-semibold text-white text-sm mb-2"
                    >
                      {issue.title}
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 + idx * 0.08 }}
                      className="text-white/70 text-sm line-clamp-2"
                    >
                      {issue.description}
                    </motion.p>
                  </div>
                  <div className="px-5 py-3 space-y-3">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + idx * 0.08 }}
                      className="flex items-center justify-between gap-2"
                    >
                      <PriorityBadge priority={issue.priority} />
                      <StatusBadge status={issue.status} />
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 + idx * 0.08 }}
                      className="text-xs text-white/70 space-y-1"
                    >
                      <p><span className="font-medium text-white/90">Ward:</span> {issue.ward}</p>
                      <p><span className="font-medium text-white/90">Date:</span> {formatDate(issue.createdAt)}</p>
                    </motion.div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectIssue(issue)}
                    className="w-full px-4 py-3 text-center font-medium text-blue-200 bg-blue-500/30 hover:bg-blue-500/40 border-t border-white/20 transition-all duration-300"
                  >
                    View Details
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {detailPanelOpen && <IssueDetailPanel issue={selectedIssue} onClose={() => setDetailPanelOpen(false)} />}
      </div>
    </div>
  );
}

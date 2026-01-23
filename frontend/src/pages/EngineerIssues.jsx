import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues, setSelectedIssue, setFilters, setSearchQuery } from '../store/issueSlice';
import { motion } from 'framer-motion';
import { 
  Search, Filter, ArrowUpDown, Eye, Clock, AlertCircle, X, 
  ChevronDown, MapPin, Calendar, CheckCircle, MoreVertical, Download
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../components/common/Badges';
import { LoadingSpinner, CardSkeleton } from '../components/common/Loaders';
import IssueDetailPanel from '../components/engineer/IssueDetailPanel';
import { filterIssues, sortIssues, formatDate } from '../utils/helpers';

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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header Section - Minimal Clean */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="px-6 py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Issues</h1>
              <p className="text-gray-500 mt-1 text-base">Track and manage your assigned civic issues</p>
            </div>
          </div>

          {/* Stats Cards - 2xl rounded, soft shadows */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats.total, color: 'bg-gradient-to-br from-slate-50 to-slate-100', borderColor: 'border-slate-200', textColor: 'text-slate-900' },
              { label: 'Pending', value: stats.pending, color: 'bg-gradient-to-br from-orange-50 to-amber-50', borderColor: 'border-orange-200', textColor: 'text-orange-900' },
              { label: 'Assigned', value: stats.assigned, color: 'bg-gradient-to-br from-blue-50 to-cyan-50', borderColor: 'border-blue-200', textColor: 'text-blue-900' },
              { label: 'In Progress', value: stats.inProgress, color: 'bg-gradient-to-br from-emerald-50 to-green-50', borderColor: 'border-emerald-200', textColor: 'text-emerald-900' }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.08 }}
                className={`${stat.color} rounded-2xl p-5 border ${stat.borderColor} shadow-sm hover:shadow-md transition-all duration-300`}
              >
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                <p className={`text-3xl font-semibold ${stat.textColor}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search & Filter Bar - Minimal */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }} 
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
          >
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all"
                />
              </div>

              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                    showFilters
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                <div className="flex gap-2 sm:ml-auto">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-2.5 rounded-lg font-medium transition-all ${viewMode === 'table' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`px-3 py-2.5 rounded-lg font-medium transition-all ${viewMode === 'card' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Cards
                  </button>
                </div>
              </div>

              {/* Expandable Filters */}
              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    >
                      <option value="all">All Priority</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    >
                      <option value="date">Newest First</option>
                      <option value="priority">Priority</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Content View - Table or Cards */}
          {filteredIssues.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No issues found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search</p>
            </motion.div>
          ) : viewMode === 'table' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Issue</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ward</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIssues.map((issue, idx) => (
                    <motion.tr
                      key={issue.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.08, duration: 0.4 }}
                      className="hover:bg-emerald-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{issue.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{issue.description?.substring(0, 50)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4"><PriorityBadge priority={issue.priority} /></td>
                      <td className="px-6 py-4"><StatusBadge status={issue.status} /></td>
                      <td className="px-6 py-4 text-sm text-gray-600">{issue.ward}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(issue.createdAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSelectIssue(issue)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium transition-colors"
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
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="p-5 border-b border-gray-200">
                    <motion.h3 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + idx * 0.08 }}
                      className="font-semibold text-gray-900 text-sm mb-2"
                    >
                      {issue.title}
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 + idx * 0.08 }}
                      className="text-gray-600 text-sm line-clamp-2"
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
                      className="text-xs text-gray-500 space-y-1"
                    >
                      <p><span className="font-medium text-gray-700">Ward:</span> {issue.ward}</p>
                      <p><span className="font-medium text-gray-700">Date:</span> {formatDate(issue.createdAt)}</p>
                    </motion.div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectIssue(issue)}
                    className="w-full px-4 py-3 text-center font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-t border-gray-200 transition-colors"
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
  );
}

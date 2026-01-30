import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, ChevronRight } from 'lucide-react';
import TopUtilityBar from '../components/common/TopUtilityBar';
import VMCHeader from '../components/common/VMCHeader';
import VMCFooter from '../components/common/VMCFooter';
import BottomNav from '../components/surveyor/BottomNav';

export default function IssueList() {
  const { t } = useTranslation();
  const { issues } = useSelector((state) => state.issues);
  const { user } = useSelector((state) => state.auth);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter issues for current surveyor
  const myIssues = issues.filter(issue => issue.submitted_by === user?.id);

  useEffect(() => {
    applyFilters();
  }, [myIssues, filter, searchQuery]);

  const applyFilters = () => {
    let filtered = [...myIssues];

    // Apply status filter
    if (filter === 'pending') {
      filtered = filtered.filter((issue) => issue.status === 'pending');
    } else if (filter === 'assigned') {
      filtered = filtered.filter((issue) => issue.status === 'assigned');
    } else if (filter === 'resolved') {
      filtered = filtered.filter((issue) => issue.status === 'resolved');
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.issue_type?.toLowerCase().includes(query) ||
          issue.description?.toLowerCase().includes(query) ||
          issue.address?.toLowerCase().includes(query)
      );
    }

    setFilteredIssues(filtered);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-orange-100 text-orange-800',
      low: 'bg-blue-100 text-blue-800',
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      <TopUtilityBar />
      <VMCHeader />
      <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-[#0a2647] text-white px-6 py-6 shadow-lg">
        <h1 className="text-2xl font-bold">My Reported Issues</h1>
        <p className="text-gray-300 text-sm mt-1">Track all your submitted civic issues</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0056b3] focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'assigned', 'resolved'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                filter === filterType
                  ? 'bg-[#0056b3] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              {filterType !== 'all' && ` (${myIssues.filter(i => i.status === filterType).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="px-4 py-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Issues Found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search' : 'Start by reporting a new issue'}
            </p>
            <Link
              to="/surveyor/report-issue"
              className="inline-block mt-4 px-6 py-3 bg-[#0056b3] text-white rounded-lg hover:bg-[#003d82] transition-colors"
            >
              Report New Issue
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <Link
                key={issue._id}
                to={`/surveyor/issues/${issue._id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="flex">
                  {/* Image */}
                  {issue.image_url && (
                    <div className="w-32 h-32 flex-shrink-0">
                      <img
                        src={`https://civic-issue-backend-ndmh.onrender.com${issue.image_url}`}
                        alt={issue.issue_type}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800 capitalize">
                          {issue.issue_type?.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {issue.description}
                        </p>
                      </div>
                      <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(issue.status)}`}>
                        {issue.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(issue.priority)}`}>
                        {issue.priority} priority
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>📍 {issue.address || 'Location not available'}</span>
                      <span>📅 {formatDate(issue.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
    <VMCFooter />
    </>
  );
}

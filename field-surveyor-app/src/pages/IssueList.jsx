import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { setIssues } from '../store/issueSlice';
import offlineStorage from '../services/offlineStorage';
import logo from '../assets/images/vmc_logo.jpg';

export default function IssueList() {
  const { list } = useSelector((state) => state.issues);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [list, filter, searchQuery]);

  const loadIssues = async () => {
    const issues = await offlineStorage.getAllIssues();
    dispatch(setIssues(issues));
  };

  const applyFilters = () => {
    let filtered = [...list];

    // Apply sync filter
    if (filter === 'synced') {
      filtered = filtered.filter((issue) => issue.synced);
    } else if (filter === 'pending') {
      filtered = filtered.filter((issue) => !issue.synced);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.issueType?.toLowerCase().includes(query) ||
          issue.description?.toLowerCase().includes(query) ||
          issue.address?.toLowerCase().includes(query)
      );
    }

    setFilteredIssues(filtered);
  };

  const getStatusColor = (synced) => {
    return synced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const handleRefresh = async () => {
    await loadIssues();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="VMC" className="w-10 h-10 rounded-full object-cover" />
          <h1 className="text-xl font-bold text-gray-800">CivicLens — Field Surveyor Web App</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">📜 Issue History</h2>
            <p className="text-blue-100">View and manage all reported issues</p>
          </div>

          <div className="p-6">
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search issues..."
              className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:border-blue-500 mb-4"
            />

            {/* Filters */}
            <div className="flex gap-2 mb-4">
              {[
                { value: 'all', label: 'All', count: list.length },
                { value: 'synced', label: 'Resolved', count: list.filter((i) => i.synced).length },
                { value: 'pending', label: 'Open', count: list.filter((i) => !i.synced).length },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={`px-4 py-2 rounded font-medium whitespace-nowrap transition-colors ${
                    filter === item.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item.label} ({item.count})
                </button>
              ))}
            </div>

            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No issues found</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Issue Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredIssues.map((issue) => (
                      <tr key={issue.localId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {issue.imageUri && (
                              <img src={issue.imageUri} alt="Issue" className="w-10 h-10 rounded object-cover" />
                            )}
                            <span className="font-medium text-gray-800 capitalize">
                              {issue.issueType?.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                          {issue.description}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {issue.address?.substring(0, 25)}...
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            issue.synced 
                              ? 'bg-green-100 text-green-700' 
                              : issue.priority === 'high' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {issue.synced ? 'Resolved' : issue.priority === 'high' ? 'Open' : 'Assigned'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/issues/${issue.localId}`}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

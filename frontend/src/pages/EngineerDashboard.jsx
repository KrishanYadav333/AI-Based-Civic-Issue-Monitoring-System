import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';

export default function EngineerDashboard() {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolutionImage, setResolutionImage] = useState(null);
  const [uploadingResolution, setUploadingResolution] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`/dashboard/engineer/${user.id}`);
      setIssues(response.data.issues);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      alert('Failed to load dashboard. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveIssue = async (issueId) => {
    if (!resolutionImage) {
      alert('Please select a resolution image');
      return;
    }

    setUploadingResolution(true);

    try {
      const formData = new FormData();
      formData.append('resolution_image', resolutionImage);

      await axios.post(`/issues/${issueId}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Issue resolved successfully!');
      setSelectedIssue(null);
      setResolutionImage(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to resolve issue:', error);
      alert('Failed to resolve issue. Please try again.');
    } finally {
      setUploadingResolution(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true;
    return issue.status === filter;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'assigned': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ward Engineer Dashboard</h1>
            <p className="text-sm text-gray-600">{user.name} - Ward {user.wardId}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">Total Issues</h3>
              <p className="text-3xl font-bold text-gray-900">{statistics.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600">{statistics.pending}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">Resolved</h3>
              <p className="text-3xl font-bold text-green-600">{statistics.resolved}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">High Priority</h3>
              <p className="text-3xl font-bold text-red-600">{statistics.high_priority}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('assigned')}
              className={`px-4 py-2 rounded ${filter === 'assigned' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Assigned
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded ${filter === 'resolved' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIssues.map(issue => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{issue.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {issue.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(issue.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {issue.status !== 'resolved' && (
                      <button
                        onClick={() => setSelectedIssue(issue)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={() => window.open(issue.image_url, '_blank')}
                      className="ml-4 text-green-600 hover:text-green-800 font-medium"
                    >
                      View Image
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Resolution Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Resolve Issue #{selectedIssue.id}</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Type: {selectedIssue.type.replace('_', ' ')}</p>
              <p className="text-sm text-gray-600 mb-2">Priority: {selectedIssue.priority}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resolution Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setResolutionImage(e.target.files[0])}
                className="w-full"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => handleResolveIssue(selectedIssue.id)}
                disabled={!resolutionImage || uploadingResolution}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingResolution ? 'Uploading...' : 'Submit Resolution'}
              </button>
              <button
                onClick={() => {
                  setSelectedIssue(null);
                  setResolutionImage(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

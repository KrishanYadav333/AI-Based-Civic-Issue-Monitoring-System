import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from '../config/axios';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, heatmapResponse] = await Promise.all([
        axios.get('/dashboard/admin/stats'),
        axios.get('/dashboard/admin/heatmap')
      ]);
      
      setStatistics(statsResponse.data);
      setHeatmapData(heatmapResponse.data.points);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      alert('Failed to load dashboard data. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const { overall, wardStats, typeStats, recentActivity } = statistics;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">{user.name}</p>
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
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'heatmap'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600">Total Issues</h3>
                <p className="text-3xl font-bold text-gray-900">{overall.total_issues}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600">Resolved</h3>
                <p className="text-3xl font-bold text-green-600">{overall.resolved_issues}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round((overall.resolved_issues / overall.total_issues) * 100)}% resolution rate
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                <p className="text-3xl font-bold text-yellow-600">{overall.pending_issues}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600">High Priority</h3>
                <p className="text-3xl font-bold text-red-600">{overall.high_priority_issues}</p>
              </div>
            </div>

            {/* Ward Statistics */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-bold text-gray-900">Ward-wise Statistics</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ward</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolved</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">High Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolution %</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {wardStats.map(ward => (
                      <tr key={ward.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {ward.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {ward.total_issues}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600">
                          {ward.resolved_issues}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-yellow-600">
                          {ward.pending_issues}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-red-600">
                          {ward.high_priority_issues}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {ward.total_issues > 0
                            ? Math.round((ward.resolved_issues / ward.total_issues) * 100)
                            : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Issue Type Statistics */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-bold text-gray-900">Issue Type Distribution</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {typeStats.map(type => (
                    <div key={type.type} className="flex items-center">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {type.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {type.count} issues ({type.resolved} resolved)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(type.resolved / type.count) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === 'heatmap' && (
          <div className="bg-white rounded-lg shadow p-6" style={{ height: '600px' }}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Issues Heatmap</h2>
            <div className="h-full">
              <MapContainer
                center={[22.3072, 73.1812]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {heatmapData.map((point, index) => (
                  <CircleMarker
                    key={index}
                    center={[point.lat, point.lng]}
                    radius={point.intensity * 3}
                    fillColor={
                      point.status === 'resolved'
                        ? '#10b981'
                        : point.intensity === 3
                        ? '#ef4444'
                        : point.intensity === 2
                        ? '#f59e0b'
                        : '#3b82f6'
                    }
                    color="white"
                    weight={1}
                    fillOpacity={0.6}
                  >
                    <Popup>
                      <div>
                        <strong>Issue #{point.issueId}</strong>
                        <br />
                        Type: {point.type.replace('_', ' ')}
                        <br />
                        Status: {point.status}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.slice(0, 20).map(activity => (
                <div key={activity.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.action} issue #{activity.issue_id} ({activity.issue_type})
                      </p>
                      {activity.notes && (
                        <p className="text-xs text-gray-500 mt-1">{activity.notes}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

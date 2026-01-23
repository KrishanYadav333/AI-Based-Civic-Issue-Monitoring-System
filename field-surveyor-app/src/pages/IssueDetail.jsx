import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import offlineStorage from '../services/offlineStorage';
import logo from '../assets/images/vmc_logo.jpg';

export default function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadIssue();
  }, [id]);

  const loadIssue = async () => {
    const issues = await offlineStorage.getAllIssues();
    const found = issues.find((i) => i.localId === id);
    setIssue(found);
  };

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gray-600">Loading issue...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (synced) => {
    return synced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="VMC" className="w-10 h-10 rounded-full object-cover" />
          <h1 className="text-xl font-bold text-gray-800">CivicLens — Field Surveyor Web App</h1>
        </div>
        <button onClick={() => navigate(-1)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
          ← Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Issue Details</h2>
            <p className="text-blue-100">View complete issue information</p>
          </div>

          <div className="grid grid-cols-2 gap-6 p-6">
            {/* Left Column - Image and Status */}
            <div className="space-y-6">
              {/* Image */}
              {issue.imageUri && (
                <div>
                  <img
                    src={issue.imageUri}
                    alt="Issue"
                    className="w-full h-80 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Status */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3">Status</h3>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(issue.synced)}`}>
                  {issue.synced ? '✅ Resolved' : '⏳ Open'}
                </span>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-4">Issue Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Issue Type</label>
                    <p className="text-lg font-semibold text-gray-800 mt-1 capitalize">
                      {issue.issueType?.replace('_', ' ')}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-800 mt-1">{issue.description}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Priority</label>
                    <p className="text-gray-800 mt-1">
                      {issue.priority === 'high' && '🔴 '}
                      {issue.priority === 'medium' && '🟡 '}
                      {issue.priority === 'low' && '🟢 '}
                      <span className="capitalize font-medium">{issue.priority}</span>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Ward</label>
                    <p className="text-gray-800 mt-1 font-medium">Ward 5 (Auto-detected)</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Reported On</label>
                    <p className="text-gray-800 mt-1">
                      {new Date(issue.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3">📍 Location</h3>
                <p className="text-sm text-gray-600 mb-3">{issue.address}</p>
                
                {issue.location && (
                  <div className="rounded-lg overflow-hidden" style={{ height: '250px' }}>
                    <MapContainer
                      center={[issue.location.latitude, issue.location.longitude]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <Marker position={[issue.location.latitude, issue.location.longitude]}>
                        <Popup>
                          <strong>{issue.issueType}</strong>
                          <br />
                          {issue.address}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500 font-mono">
                  GPS: {issue.location?.latitude.toFixed(6)}, {issue.location?.longitude.toFixed(6)}
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  <span className="font-medium">Local ID:</span> {issue.localId}
                  {issue.serverId && (
                    <div><span className="font-medium">Server ID:</span> {issue.serverId}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

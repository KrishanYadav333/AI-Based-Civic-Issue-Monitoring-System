import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPin, Calendar, Tag, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import TopUtilityBar from '../components/common/TopUtilityBar';
import VMCHeader from '../components/common/VMCHeader';
import VMCFooter from '../components/common/VMCFooter';
import BottomNav from '../components/surveyor/BottomNav';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { issues } = useSelector((state) => state.issues);
  const [issue, setIssue] = useState(null);

  useEffect(() => {
    const found = issues.find((i) => i._id === id);
    setIssue(found);
  }, [id, issues]);

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-gray-600 text-lg">Loading issue details...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      assigned: 'bg-blue-100 text-blue-800 border-blue-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <TopUtilityBar />
      <VMCHeader />
      <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-[#0a2647] text-white px-6 py-4 shadow-lg">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-3 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Issues</span>
        </button>
        <h1 className="text-2xl font-bold capitalize">{issue.issue_type?.replace(/_/g, ' ')}</h1>
        <p className="text-gray-300 text-sm mt-1">Issue Details</p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Status and Priority Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-lg border-2 p-4 ${getStatusColor(issue.status)}`}>
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <div>
                <p className="text-xs opacity-80">Status</p>
                <p className="font-semibold capitalize">{issue.status}</p>
              </div>
            </div>
          </div>
          <div className={`rounded-lg border-2 p-4 ${getPriorityColor(issue.priority)}`}>
            <div className="flex items-center gap-2">
              <Tag size={20} />
              <div>
                <p className="text-xs opacity-80">Priority</p>
                <p className="font-semibold capitalize">{issue.priority}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Image */}
        {issue.image_url && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <img
              src={`https://civic-issue-backend-ndmh.onrender.com${issue.image_url}`}
              alt={issue.issue_type}
              className="w-full h-80 object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
              }}
            />
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            📝 Description
          </h2>
          <p className="text-gray-700 leading-relaxed">{issue.description}</p>
        </div>

        {/* Details */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Issue Information</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="text-[#0056b3] flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-800">{issue.address || 'Address not available'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {issue.latitude && issue.longitude
                    ? `${issue.latitude.toFixed(6)}, ${issue.longitude.toFixed(6)}`
                    : 'Coordinates not available'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="text-[#0056b3] flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">Reported On</p>
                <p className="text-gray-800">{formatDate(issue.created_at)}</p>
              </div>
            </div>

            {issue.ward_id && (
              <div className="flex items-start gap-3">
                <Tag className="text-[#0056b3] flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Ward</p>
                  <p className="text-gray-800">Ward {issue.ward_id}</p>
                </div>
              </div>
            )}

            {issue.assigned_to && (
              <div className="flex items-start gap-3">
                <AlertCircle className="text-[#0056b3] flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <p className="text-gray-800">Engineer #{issue.assigned_to}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        {issue.latitude && issue.longitude && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                🗺️ Location on Map
              </h2>
            </div>
            <div className="h-80">
              <MapContainer
                center={[issue.latitude, issue.longitude]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[issue.latitude, issue.longitude]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold capitalize">{issue.issue_type?.replace(/_/g, ' ')}</p>
                      <p className="text-gray-600 text-xs mt-1">{issue.address}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <a
                href={`https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-[#0056b3] hover:text-[#003d82] transition-colors text-sm font-medium"
              >
                <ExternalLink size={16} />
                Open in Google Maps
              </a>
            </div>
          </div>
        )}

        {/* Resolution Info */}
        {issue.status === 'resolved' && issue.resolution_image && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-green-800 mb-3">✅ Resolution</h2>
            {issue.resolution_image && (
              <img
                src={`https://civic-issue-backend-ndmh.onrender.com${issue.resolution_image}`}
                alt="Resolution"
                className="w-full rounded-lg mb-3"
              />
            )}
            {issue.resolution_notes && (
              <p className="text-gray-700">{issue.resolution_notes}</p>
            )}
            {issue.resolved_at && (
              <p className="text-sm text-gray-600 mt-2">
                Resolved on {formatDate(issue.resolved_at)}
              </p>
            )}
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

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import offlineStorage from '../services/offlineStorage';
import logo from '../assets/images/vmc_logo.jpg';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      await offlineStorage.clearAll();
      alert('Local data cleared successfully');
      window.location.reload();
    }
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

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left - Profile Card */}
          <div className="col-span-1 bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4 flex items-center justify-center text-5xl">
                👨
              </div>
              <h2 className="text-xl font-bold text-gray-800">{user?.name || 'John Smith'}</h2>
              <p className="text-sm text-gray-600">Field Surveyor</p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span>📧</span>
                <span className="truncate">{user?.email || 'john.smith@example.com'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span>📱</span>
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span>🆔</span>
                <span>Employee ID: FS-1024</span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full mt-6 bg-red-600 text-white py-3 rounded font-semibold hover:bg-red-700"
            >
              🚪 Logout
            </button>
          </div>

          {/* Right - Settings */}
          <div className="col-span-2 space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-bold text-gray-800 mb-4 text-lg">👤 Account Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Username</span>
                  <span className="font-medium text-gray-800">{user?.username || 'surveyor'}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">User ID</span>
                  <span className="font-medium text-gray-800">{user?.id || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-600">Department</span>
                  <span className="font-medium text-gray-800">Field Operations</span>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-bold text-gray-800 mb-4 text-lg">⚙️ Settings</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded border">
                  <span className="text-gray-700">Change Password</span>
                  <span className="text-blue-600">→</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded border">
                  <span className="text-gray-700">Notification Settings</span>
                  <span className="text-blue-600">→</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded border">
                  <span className="text-gray-700">Language</span>
                  <span className="text-gray-600">English</span>
                </button>
              </div>
            </div>

            {/* App Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-bold text-gray-800 mb-4 text-lg">📱 App Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Version</span>
                  <span className="font-medium text-gray-800">1.0.0</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Platform</span>
                  <span className="font-medium text-gray-800">Web</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-600">Network Status</span>
                  <span className={`font-medium ${navigator.onLine ? 'text-green-600' : 'text-red-600'}`}>
                    {navigator.onLine ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleClearData}
                className="w-full mt-4 bg-red-50 text-red-600 border border-red-200 py-3 rounded font-medium hover:bg-red-100"
              >
                🗑️ Clear Local Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

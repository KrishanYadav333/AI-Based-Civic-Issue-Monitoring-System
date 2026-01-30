import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logout } from '../store/authSlice';
import { User, Mail, LogOut, Trash2, Info } from 'lucide-react';
import TopUtilityBar from '../components/common/TopUtilityBar';
import VMCHeader from '../components/common/VMCHeader';
import VMCFooter from '../components/common/VMCFooter';
import BottomNav from '../components/surveyor/BottomNav';

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { issues } = useSelector((state) => state.issues);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Calculate user stats
  const myIssues = issues.filter(issue => issue.submitted_by === user?.id);
  const stats = {
    total: myIssues.length,
    pending: myIssues.filter(i => i.status === 'pending').length,
    assigned: myIssues.filter(i => i.status === 'assigned').length,
    resolved: myIssues.filter(i => i.status === 'resolved').length,
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      navigate('/login');
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear browser cache? This will refresh the page.')) {
      localStorage.removeItem('persist:root');
      window.location.reload();
    }
  };

  return (
    <>
      <TopUtilityBar />
      <VMCHeader />
      <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-[#0a2647] text-white px-6 py-6 shadow-lg">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-gray-300 text-sm mt-1">View and manage your account</p>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Profile Card */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0056b3] to-[#003d82] mx-auto mb-4 flex items-center justify-center text-5xl text-white shadow-lg">
                {user?.username?.[0]?.toUpperCase() || '👤'}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{user?.username || 'User'}</h2>
              <p className="text-sm text-gray-600 capitalize">{user?.role || 'Surveyor'}</p>
            </div>
            
            <div className="space-y-3 text-sm border-t border-gray-200 pt-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail size={18} className="text-[#0056b3]" />
                <span className="truncate">{user?.email || 'email@example.com'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <User size={18} className="text-[#0056b3]" />
                <span>ID: {user?.id || 'N/A'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-6 border-t border-gray-200 pt-4">
              <button
                onClick={handleClearData}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Trash2 size={18} />
                Clear Cache
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {/* Right - Stats and Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📊 Issue Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Issues</p>
                </div>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-sm text-gray-600 mt-1">Pending</p>
                </div>
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-indigo-600">{stats.assigned}</p>
                  <p className="text-sm text-gray-600 mt-1">Assigned</p>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                  <p className="text-sm text-gray-600 mt-1">Resolved</p>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Info size={20} className="text-[#0056b3]" />
                About Your Role
              </h3>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  As a <span className="font-semibold text-[#0056b3]">Field Surveyor</span>, you play a crucial role in improving our city's infrastructure and services.
                </p>
                <div className="bg-blue-50 border-l-4 border-[#0056b3] p-4 rounded">
                  <p className="font-semibold text-gray-800 mb-2">Your Responsibilities:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Report civic issues with photos and location details</li>
                    <li>Track the status of your submitted issues</li>
                    <li>Provide accurate descriptions and priority levels</li>
                    <li>Help improve community infrastructure</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">⚙️ System Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span>App Version</span>
                  <span className="font-medium text-gray-800">2.0.0</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span>Last Login</span>
                  <span className="font-medium text-gray-800">{new Date().toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span>Account Status</span>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Platform</span>
                  <span className="font-medium text-gray-800">Web App</span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-r from-[#0056b3] to-[#003d82] rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
              <p className="text-sm text-gray-100 mb-4">
                If you encounter any issues or have questions about using the surveyor app, please contact the support team.
              </p>
              <a
                href="mailto:support@vmc.gov.in"
                className="inline-block px-6 py-2 bg-white text-[#0056b3] rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
    <VMCFooter />
    </>
  );
}

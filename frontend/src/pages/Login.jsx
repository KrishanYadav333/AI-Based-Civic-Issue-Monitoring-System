import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TEST_USERS = [
  { email: 'admin@vmc.gov.in', password: 'Admin@123456', role: 'Admin', name: 'VMC Admin' },
  { email: 'engineer1@vmc.gov.in', password: 'Engineer@123456', role: 'Engineer', name: 'Engineer Ward 1' },
  { email: 'engineer2@vmc.gov.in', password: 'Engineer@123456', role: 'Engineer', name: 'Engineer Ward 2' },
  { email: 'surveyor@vmc.gov.in', password: 'Surveyor@123456', role: 'Surveyor', name: 'Field Surveyor' }
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setShowQuickLogin(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">VMC</h1>
          <h2 className="text-xl text-gray-600 mt-2">Civic Issue Monitoring</h2>
        </div>

        {/* Quick Login Dropdown */}
        <div className="mb-4 relative">
          <button
            type="button"
            onClick={() => setShowQuickLogin(!showQuickLogin)}
            className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center justify-between border border-blue-200"
          >
            <span className="text-sm font-medium">🚀 Quick Test Login</span>
            <svg
              className={`w-5 h-5 transition-transform ${showQuickLogin ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showQuickLogin && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
              {TEST_USERS.map((user, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleQuickLogin(user)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b last:border-b-0"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    user.role === 'Admin' ? 'bg-purple-600' :
                    user.role === 'Engineer' ? 'bg-blue-600' :
                    'bg-green-600'
                  }`}>
                    {user.role[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'Engineer' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user.role}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="engineer@vmc.gov.in"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>For VMC employees only</p>
        </div>
      </div>
    </div>
  );
}

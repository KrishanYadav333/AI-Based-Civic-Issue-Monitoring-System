import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import apiService from '../services/api';
import logo from '../assets/images/vmc_logo.jpg';
import loginImage from '../assets/images/Login_page_image.jpg';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    
    // Demo offline login - works without backend
    if (credentials.username === 'surveyor' && credentials.password === 'password123') {
      const demoData = {
        user: {
          id: 1,
          name: 'Field Surveyor',
          username: 'surveyor',
          email: 'surveyor@civic.com',
          role: 'surveyor',
        },
        token: 'demo_token_' + Date.now(),
      };
      
      dispatch(loginSuccess(demoData));
      navigate('/');
    } else {
      // Try backend API if credentials don't match demo
      try {
        const data = await apiService.login(credentials);
        dispatch(loginSuccess(data));
        navigate('/');
      } catch (err) {
        dispatch(loginFailure('Invalid credentials. Use demo: surveyor/password123'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Sidebar - Branding & Login */}
      <div className="w-96 bg-white shadow-xl flex flex-col justify-center p-8">
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-white border-2 border-orange-500 rounded-full flex items-center justify-center overflow-hidden">
              <img src={logo} alt="VMC Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            CivicLens
          </h1>
          <p className="text-gray-600 text-sm">Field Surveyor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Username"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Password"
              required
            />
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="remember" className="mr-2" />
            <label htmlFor="remember" className="text-sm text-gray-600">Remember Me</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="text-center">
            <a href="#" className="text-sm text-blue-600 hover:underline">Forgot Password?</a>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Demo: surveyor / password123</p>
        </div>
      </div>

      {/* Right Side - Hero/Info */}
      <div className="flex-1 bg-gray-900 flex items-center justify-center p-12 relative overflow-hidden">
        <img 
          src={loginImage} 
          alt="Civic Infrastructure" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="text-white text-center max-w-2xl relative z-10">
          <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">CivicLens</h2>
          <p className="text-2xl mb-4 drop-shadow-lg">Field Surveyor Web App</p>
          <p className="text-lg drop-shadow-lg">
            Empowering field surveyors to efficiently report and manage civic issues with
            real-time GPS tracking, photo documentation, and offline-first capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}

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
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{
        backgroundImage: `url(${loginImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Navy blue gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-blue-800/30 to-blue-600/35"></div>
      
      {/* Glassmorphism Login Card */}
      <div className="w-full max-w-md glass-card-strong rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-lg">
              <img src={logo} alt="VMC Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-2 metallic-text">
            CivicLens
          </h1>
          <p className="text-lg font-medium metallic-text-secondary">Field Surveyor Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="glass-card bg-red-500/20 border-red-400/50 text-white px-4 py-3 rounded-xl text-sm backdrop-blur-md">
              {error}
            </div>
          )}

          <div>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-4 py-3 glass-card-light text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="Username"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 glass-card-light text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="Password"
              required
            />
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="remember" className="mr-2 accent-blue-600" />
            <label htmlFor="remember" className="text-sm text-white/80">Remember Me</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 shadow-lg transform hover:scale-105 duration-200"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="text-center">
            <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Forgot Password?</a>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/20 text-center text-xs text-white/60">
          <p>Demo: surveyor / password123</p>
        </div>
      </div>
    </div>
  );
}

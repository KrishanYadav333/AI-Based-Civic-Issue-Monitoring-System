import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../store/authSlice';
import { motion } from 'framer-motion';
import loginImage from '../assets/images/Login_page_image.jpg';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(state => state.auth);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');

  // Redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'admin' ? '/dashboard' : '/engineer/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
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
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card-strong p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-2 metallic-text">
              CivicLens
            </h1>
            <p className="text-lg font-medium metallic-text-secondary">
              Admin & Engineer Dashboard
            </p>
          </div>

          {error && (
            <div className="glass-card bg-red-500/20 border-red-400/50 text-white px-4 py-3 rounded-xl text-sm backdrop-blur-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 glass-card-light text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all border border-white/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 glass-card-light text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all border border-white/20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 shadow-lg transform hover:scale-105 duration-200 mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 glass-card-light rounded-xl text-sm text-white/90">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <p><strong>Admin:</strong> admin@example.com / password</p>
            <p><strong>Engineer:</strong> engineer1@example.com / password</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

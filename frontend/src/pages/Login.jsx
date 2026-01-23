import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../store/authSlice';
import { Card, Button, Input } from '../components/common/FormElements';
import { Alert } from '../components/common/Alerts';
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

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="glass-card-light text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="glass-card-light text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 shadow-lg transform hover:scale-105 duration-200"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
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

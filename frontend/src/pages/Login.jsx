import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../store/authSlice';
import TopUtilityBar from '../components/common/TopUtilityBar';
import VMCHeader from '../components/common/VMCHeader';
import VMCFooter from '../components/common/VMCFooter';
import { Card, Button, Input } from '../components/common/FormElements';
import { Alert } from '../components/common/Alerts';
import { motion } from 'framer-motion';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(state => state.auth);
  const [email, setEmail] = useState('admin@civic.com');
  const [password, setPassword] = useState('admin123');
  
  // Demo users for quick login
  const demoUsers = [
    { label: 'Admin User', email: 'admin@civic.com', password: 'admin123' },
    { label: 'Engineer User', email: 'engineer@civic.com', password: 'engineer123' },
    { label: 'Surveyor User', email: 'surveyor@civic.com', password: 'surveyor123' },
  ];

  const handleDemoLogin = (demoUser) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    // Auto-submit after selecting
    setTimeout(() => {
      dispatch(loginUser({ email: demoUser.email, password: demoUser.password }));
    }, 100);
  };

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopUtilityBar />
      <VMCHeader />
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#0056b3] text-white shadow-md">
        <div className="px-4 md:px-10 py-3 flex items-center justify-between">
          <ul className="hidden md:flex items-center gap-1 text-sm font-medium">
            <li className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/')}>Home</li>
            <li className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer border-l border-white/20">About VMC System</li>
            <li className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer border-l border-white/20">Contact Us</li>
          </ul>
          <button 
            onClick={() => navigate('/')}
            className="bg-white text-[#0056b3] px-6 py-2 rounded-sm font-bold text-sm hover:bg-slate-100 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-[#003366] py-12">
        <div className="container mx-auto px-5">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Staff Login Portal</h1>
            <p className="text-white/80">Access your administrative dashboard</p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="container mx-auto px-5 py-12 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md mx-auto"
        >
          <Card className="p-8 shadow-lg bg-white border border-slate-200">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-[#003366] rounded-full mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#003366]">Welcome Back</h2>
              <p className="text-slate-600 mt-2">
                Sign in to manage civic issues
              </p>
            </div>

            {error && <Alert type="error" message={error} className="mb-4" />}

            {/* Quick Demo Login Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                🎯 Quick Demo Login
              </label>
              <select
                onChange={(e) => {
                  const selectedUser = demoUsers[e.target.value];
                  if (selectedUser) handleDemoLogin(selectedUser);
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-[#0056b3] focus:border-transparent transition-all"
                defaultValue=""
              >
                <option value="" disabled>Select a demo user to login instantly</option>
                {demoUsers.map((user, index) => (
                  <option key={index} value={index}>
                    {user.label} - {user.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                ⚡ Select any option above for instant login (for demonstration)
              </p>
            </div>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or login manually</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@civic.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full bg-[#003366] hover:bg-[#002244] text-white py-3 rounded-sm font-semibold transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-sm">
              <p className="font-semibold text-[#003366] mb-2 text-sm">Demo Credentials:</p>
              <div className="text-sm text-slate-700 space-y-1">
                <p><span className="font-semibold">Admin:</span> admin@civic.com / admin123</p>
                <p><span className="font-semibold">Engineer:</span> engineer@civic.com / engineer123</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      
      <VMCFooter />
    </div>
  );
};

export default Login;

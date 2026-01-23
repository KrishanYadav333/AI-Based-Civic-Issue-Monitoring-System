import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../store/authSlice';
import { Card, Button, Input } from '../components/common/FormElements';
import { Alert } from '../components/common/Alerts';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Civic Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Issue Management System
            </p>
          </div>

          {error && <Alert type="error" message={error} />}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full"
            >
              Login
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <p><strong>Admin:</strong> admin@example.com / password</p>
            <p><strong>Engineer:</strong> engineer1@example.com / password</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;

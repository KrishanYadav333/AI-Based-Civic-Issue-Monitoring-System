import React, { useState } from 'react';
import { Menu, X, LogOut, Settings } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { motion } from 'framer-motion';

const Navbar = ({ sidebarOpen, setSidebarOpen, onSearch }) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="glass-card-strong border-b border-white/20 sticky top-0 z-40 shadow-lg backdrop-blur-xl">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition text-white"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <h1 className="text-lg font-semibold metallic-text">
            Civic Dashboard
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition border border-white/20"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-white">
                Admin User
              </span>
            </button>

            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 glass-card-strong border border-white/20 rounded-lg shadow-2xl py-2"
              >
                <div className="px-4 py-2 border-b border-white/20">
                  <p className="text-sm font-semibold text-white">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-white/70">{user?.email || 'admin@example.com'}</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-white/10 flex items-center gap-2 transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

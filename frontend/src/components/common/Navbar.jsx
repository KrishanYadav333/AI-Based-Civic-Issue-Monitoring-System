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
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-sm transition-all text-[#003366]"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <h1 className="text-lg font-bold text-[#003366] uppercase tracking-wide">
            Civic Dashboard
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-sm transition-all border border-slate-200"
            >
              <div className="w-8 h-8 bg-[#0056b3] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-[#003366]">
                Admin User
              </span>
            </button>

            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-sm shadow-lg py-2"
              >
                <div className="px-4 py-2 border-b border-slate-200">
                  <p className="text-sm font-semibold text-[#003366]">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-slate-500">{user?.email || 'admin@example.com'}</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-all">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-all"
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

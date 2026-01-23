import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Map,
  BarChart3,
  Users,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const user = useSelector(state => state.auth.user);

  const isActive = (path) => location.pathname.includes(path);

  const adminMenu = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Map, label: 'Map View', path: '/admin/map' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
  ];

  const engineerMenu = [
    { icon: Home, label: 'Dashboard', path: '/engineer/dashboard' },
    { icon: CheckCircle, label: 'My Issues', path: '/engineer/issues' },
    { icon: BarChart3, label: 'Performance', path: '/engineer/performance' },
  ];

  const menu = user?.role === 'admin' ? adminMenu : engineerMenu;

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 glass-card-strong border-r border-white/20 overflow-y-auto z-30 shadow-2xl transition-all duration-300 ${
        isOpen ? '' : 'hidden md:block'
      }`}
    >
      <div className="p-4 space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
                active
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                  : 'text-white/90 hover:bg-white/10 hover:shadow-md'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Sidebar;

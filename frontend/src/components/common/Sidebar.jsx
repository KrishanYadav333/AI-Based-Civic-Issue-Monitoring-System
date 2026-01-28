import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MapPin, BarChart3, Settings, Users, ClipboardList, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const user = useSelector(state => state.auth.user);

  const isActive = (path) => location.pathname === path;

  const adminMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: MapPin, label: 'Map View', path: '/admin/map' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const engineerMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/engineer/dashboard' },
    { icon: ClipboardList, label: 'My Issues', path: '/engineer/issues' },
    { icon: TrendingUp, label: 'Performance', path: '/engineer/performance' },
    { icon: Settings, label: 'Settings', path: '/engineer/settings' },
  ];

  const menu = user?.role === 'admin' ? adminMenu : engineerMenu;

  return (
    <aside className={`w-64 bg-white border-r border-slate-200 min-h-screen ${isOpen ? '' : 'hidden md:block'}`}>
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-[#003366] uppercase tracking-wide">
          {user?.role === 'admin' ? 'Admin Panel' : 'Engineer Panel'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">VMC Portal</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all ${
                    active
                      ? 'bg-[#0056b3] text-white border-l-4 border-[#003366] shadow-md'
                      : 'text-slate-700 hover:bg-slate-100 hover:border-l-4 hover:border-[#0056b3]'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

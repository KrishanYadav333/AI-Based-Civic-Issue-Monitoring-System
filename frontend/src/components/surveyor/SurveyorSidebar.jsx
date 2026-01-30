import React from 'react';
import { Camera, FileText, BarChart3, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const SurveyorSidebar = () => {
  const navItems = [
    {
      to: '/surveyor/dashboard',
      icon: BarChart3,
      label: 'Dashboard',
    },
    {
      to: '/surveyor/report-issue',
      icon: Camera,
      label: 'Report Issue',
    },
    {
      to: '/surveyor/my-issues',
      icon: FileText,
      label: 'My Issues',
    },
    {
      to: '/surveyor/settings',
      icon: Settings,
      label: 'Settings',
    },
  ];

  return (
    <div className="w-64 bg-[#0a2647] text-white min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Surveyor Portal</h2>
        <p className="text-sm text-gray-400">Report & Track Issues</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#0056b3] text-white'
                  : 'text-gray-300 hover:bg-[#144272]'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default SurveyorSidebar;

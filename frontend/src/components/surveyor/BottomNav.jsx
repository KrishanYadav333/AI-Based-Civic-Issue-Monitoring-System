import { NavLink } from 'react-router-dom';
import { Home, FileText, Camera, User } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { path: '/surveyor/dashboard', label: 'Home', icon: Home },
    { path: '/surveyor/issues', label: 'Issues', icon: FileText },
    { path: '/surveyor/report-issue', label: 'Report', icon: Camera },
    { path: '/surveyor/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-lg mx-auto px-2">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'text-[#0056b3] bg-blue-50'
                  : 'text-gray-600 hover:text-[#0056b3] hover:bg-gray-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={24} className={isActive ? 'text-[#0056b3]' : 'text-gray-600'} />
                <span className={`text-xs font-medium ${isActive ? 'text-[#0056b3]' : 'text-gray-600'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

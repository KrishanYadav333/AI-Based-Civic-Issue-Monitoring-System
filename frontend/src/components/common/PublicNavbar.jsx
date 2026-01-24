import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const PublicNavbar = () => {
  const navItems = [
    { path: '/', label: 'About VMC System', hasIcon: true },
    { path: '/services', label: 'Citizen Services' },
    { path: '/ward-dashboard', label: 'Ward Dashboard' },
    { path: '/issue-reporting', label: 'Issue Reporting' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/contact', label: 'Contact Us' },
  ];

  return (
    <nav className="bg-gradient-to-br from-[#144272] to-[#0a2647]">
      <div className="container mx-auto px-5">
        <div className="flex justify-between items-center">
          <ul className="flex list-none gap-0">
            {navItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => 
                    `flex items-center gap-1.5 px-5 py-3.5 text-white/90 text-sm font-medium transition-all relative hover:text-white hover:bg-white/8 ${
                      isActive ? 'text-white bg-white/10 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#e67e22]' : ''
                    }`
                  }
                >
                  {item.hasIcon && <Home className="w-4 h-4" />}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <button className="p-2.5 bg-transparent text-white/90 hover:bg-white/10 hover:text-white rounded transition-all" aria-label="Search">
            <Search className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;

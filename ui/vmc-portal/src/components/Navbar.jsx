import { NavLink } from 'react-router-dom';
import { HomeIcon, SearchIcon } from './Icons';
import './Navbar.css';

const Navbar = () => {
    const navItems = [
        { path: '/', label: 'About VMC System', hasIcon: true },
        { path: '/services', label: 'Citizen Services' },
        { path: '/ward-dashboard', label: 'Ward Dashboard' },
        { path: '/issue-reporting', label: 'Issue Reporting' },
        { path: '/analytics', label: 'Analytics' },
        { path: '/contact', label: 'Contact Us' },
    ];

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <ul className="nav-links">
                    {navItems.map((item, index) => (
                        <li key={index}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                end={item.path === '/'}
                            >
                                {item.hasIcon && <HomeIcon />}
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
                <button className="search-btn" aria-label="Search">
                    <SearchIcon />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

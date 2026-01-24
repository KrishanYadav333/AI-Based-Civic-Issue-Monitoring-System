import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ReportIcon,
    TrackStatusIcon,
    MapIcon,
    ChartIcon,
    PotholeIcon,
    GarbageIcon,
    DebrisIcon,
    StrayCattleIcon,
    BrokenRoadIcon,
    ManholeIcon,
    ExternalLinkIcon,
    DownloadIcon,
    BellIcon,
    CalendarIcon,
    ArrowRightIcon
} from '../components/Icons';
import './Home.css';

const Home = () => {
    const [selectedWard, setSelectedWard] = useState('1');

    const quickServices = [
        { icon: <ReportIcon />, title: 'Report Issue', desc: 'Submit civic complaints', link: '/issue-reporting', color: '#e74c3c' },
        { icon: <TrackStatusIcon />, title: 'Track Status', desc: 'Monitor complaint progress', link: '/track-status', color: '#3498db' },
        { icon: <MapIcon />, title: 'Ward Map', desc: 'View ward boundaries', link: '/ward-dashboard', color: '#27ae60' },
        { icon: <ChartIcon />, title: 'Analytics', desc: 'View city statistics', link: '/analytics', color: '#9b59b6' },
    ];

    const dashboardLinks = [
        { title: 'ADMIN DASHBOARD', color: '#3498db', icon: '🔐' },
        { title: 'NOTIFICATIONS', color: '#e67e22', icon: '🔔' },
        { title: 'ANALYTICS REPORTS', color: '#27ae60', icon: '📊' },
        { title: 'EMERGENCY HELPLINE', color: '#e74c3c', icon: '📞' },
    ];

    const cityStats = [
        { value: '12,842', label: 'Total Issues Reported' },
        { value: '11,594', label: 'Issues Resolved' },
        { value: '1,248', label: 'Pending Issues' },
        { value: '90.3%', label: 'Resolution Rate' },
        { value: '3.4', label: 'Avg. Days to Resolve' },
        { value: '19', label: 'Active Wards' },
    ];

    const civicConcerns = [
        { icon: <PotholeIcon />, label: 'Potholes', count: 2847, priority: 'high' },
        { icon: <GarbageIcon />, label: 'Garbage', count: 3921, priority: 'high' },
        { icon: <DebrisIcon />, label: 'Debris', count: 1256, priority: 'medium' },
        { icon: <StrayCattleIcon />, label: 'Stray Cattle', count: 892, priority: 'medium' },
        { icon: <BrokenRoadIcon />, label: 'Broken Roads', count: 1654, priority: 'high' },
        { icon: <ManholeIcon />, label: 'Open Manholes', count: 423, priority: 'critical' },
    ];

    const wardStats = {
        '1': { totalIssues: 205, resolved: 188, pending: 17, resolutionRate: 92 },
        '2': { totalIssues: 189, resolved: 165, pending: 24, resolutionRate: 87 },
    };

    const currentWardData = wardStats[selectedWard] || wardStats['1'];

    const announcements = [
        { title: 'System Maintenance Notice', date: '2024-10-20', type: 'info' },
        { title: 'New Ward Added: Ward 19', date: '2024-10-18', type: 'success' },
        { title: 'Holiday Schedule Update', date: '2024-10-15', type: 'warning' },
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content-wrapper">
                    <div className="hero-text-section">
                        <div className="hero-text-content">
                            <h1>Empowering Citizens,<br />Transforming Urban Governance</h1>
                            <p>
                                An AI-powered platform for proactive civic issue monitoring and resolution across Vadodara city.
                                Report, track, and resolve civic issues in real-time with our advanced geo-fencing technology.
                            </p>
                            <div className="hero-buttons">
                                <Link to="/issue-reporting" className="btn-hero-primary">
                                    Report an Issue <ArrowRightIcon />
                                </Link>
                                <Link to="/about" className="btn-hero-secondary">
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="hero-image-section">
                        {/* Using Laxmi Vilas Palace image from Vadodara */}
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Lakshmi_Vilas_Palace.jpg/1280px-Lakshmi_Vilas_Palace.jpg"
                            alt="Laxmi Vilas Palace, Vadodara"
                            className="hero-image"
                        />
                        <div className="hero-image-overlay"></div>
                    </div>
                </div>
            </section>

            {/* Quick Services */}
            <section className="quick-services-section">
                <div className="container">
                    <h2 className="section-title">Quick Services</h2>
                    <div className="quick-services-grid">
                        {quickServices.map((service, index) => (
                            <Link to={service.link} key={index} className="quick-service-card">
                                <div className="service-icon" style={{ backgroundColor: `${service.color}15`, color: service.color }}>
                                    {service.icon}
                                </div>
                                <div className="service-text">
                                    <h3>{service.title}</h3>
                                    <p>{service.desc}</p>
                                </div>
                                <ArrowRightIcon />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dashboard Links & Announcements */}
            <section className="dashboard-section">
                <div className="container">
                    <div className="dashboard-grid">
                        {/* Dashboard Buttons */}
                        <div className="dashboard-buttons">
                            {dashboardLinks.map((link, index) => (
                                <button
                                    key={index}
                                    className="dashboard-btn"
                                    style={{ backgroundColor: link.color }}
                                >
                                    <span className="dash-icon">{link.icon}</span>
                                    {link.title}
                                    <ExternalLinkIcon />
                                </button>
                            ))}
                        </div>

                        {/* Announcements */}
                        <div className="announcements-card">
                            <h3 className="card-heading">
                                <BellIcon /> Latest Announcements
                            </h3>
                            <div className="announcements-list">
                                {announcements.map((item, index) => (
                                    <div key={index} className={`announcement-item ${item.type}`}>
                                        <div className="announcement-content">
                                            <span className="announcement-title">{item.title}</span>
                                            <span className="announcement-date">
                                                <CalendarIcon /> {item.date}
                                            </span>
                                        </div>
                                        <ArrowRightIcon />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* City-Wide Statistics */}
            <section className="city-stats-section">
                <div className="container">
                    <h2 className="section-title">City-Wide Statistics</h2>
                    <div className="stats-grid">
                        {cityStats.map((stat, index) => (
                            <div key={index} className="stat-card">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Key Civic Concerns */}
            <section className="civic-concerns-section">
                <div className="container">
                    <h2 className="section-title">Key Civic Concerns</h2>
                    <div className="concerns-grid">
                        {civicConcerns.map((concern, index) => (
                            <div key={index} className={`concern-card ${concern.priority}`}>
                                <div className="concern-icon">{concern.icon}</div>
                                <div className="concern-info">
                                    <span className="concern-count">{concern.count.toLocaleString()}</span>
                                    <span className="concern-label">{concern.label}</span>
                                </div>
                                <span className={`concern-priority ${concern.priority}`}>
                                    {concern.priority === 'critical' ? 'Critical' : concern.priority === 'high' ? 'High' : 'Medium'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ward-Wise Monitoring */}
            <section className="ward-monitoring-section">
                <div className="container">
                    <div className="ward-header">
                        <div className="ward-header-text">
                            <h2>Ward-Wise Monitoring Coverage</h2>
                            <p>Select an administrative ward to view its specific performance metrics and critical issue density.</p>
                        </div>
                        <div className="ward-selector">
                            <label>SELECT ADMINISTRATIVE WARD</label>
                            <select
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                            >
                                {Array.from({ length: 19 }, (_, i) => (
                                    <option key={i + 1} value={String(i + 1)}>Ward {i + 1}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="ward-stats-grid">
                        <div className="ward-stat-card">
                            <span className="ward-stat-label">TOTAL ISSUES</span>
                            <span className="ward-stat-value">{currentWardData.totalIssues}</span>
                        </div>
                        <div className="ward-stat-card">
                            <span className="ward-stat-label">RESOLVED</span>
                            <span className="ward-stat-value green">{currentWardData.resolved}</span>
                        </div>
                        <div className="ward-stat-card">
                            <span className="ward-stat-label">RESOLUTION RATE</span>
                            <span className="ward-stat-value orange">{currentWardData.resolutionRate}%</span>
                        </div>
                        <div className="ward-stat-card">
                            <span className="ward-stat-label">PENDING</span>
                            <span className="ward-stat-value">{currentWardData.pending}</span>
                        </div>
                    </div>

                    <div className="ward-download">
                        <button className="download-report-btn">
                            Download Ward Report <ExternalLinkIcon />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

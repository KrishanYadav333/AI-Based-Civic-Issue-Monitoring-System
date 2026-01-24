import { useState } from 'react';
import {
    PotholeIcon,
    GarbageIcon,
    StreetLightIcon,
    WaterSupplyIcon,
    DownloadIcon,
    ChevronRightIcon
} from '../components/Icons';
import './WardDashboard.css';

const WardDashboard = () => {
    const [selectedWard, setSelectedWard] = useState('1');

    const wardData = {
        '1': {
            totalIssues: 205,
            resolved: 188,
            pending: 17,
            resolutionRate: 92,
            topConcern: 'Potholes',
            potholes: 45,
            garbage: 62,
            streetLights: 28,
            waterSupply: 18,
            others: 52
        },
        '2': {
            totalIssues: 189,
            resolved: 165,
            pending: 24,
            resolutionRate: 87,
            topConcern: 'Garbage',
            potholes: 32,
            garbage: 78,
            streetLights: 22,
            waterSupply: 15,
            others: 42
        }
    };

    const data = wardData[selectedWard] || wardData['1'];

    const recentIssues = [
        { id: 'VMC-2024-1892', type: 'Pothole', location: 'Alkapuri Main Road', status: 'In Progress', date: '2024-10-20' },
        { id: 'VMC-2024-1890', type: 'Garbage', location: 'Sayajigunj Market', status: 'Resolved', date: '2024-10-20' },
        { id: 'VMC-2024-1887', type: 'Street Light', location: 'Race Course Circle', status: 'Assigned', date: '2024-10-19' },
        { id: 'VMC-2024-1885', type: 'Water Supply', location: 'Fatehgunj Road', status: 'Pending', date: '2024-10-19' },
        { id: 'VMC-2024-1882', type: 'Pothole', location: 'Manjalpur Area', status: 'Resolved', date: '2024-10-18' },
    ];

    const issueDistribution = [
        { type: 'Potholes', count: data.potholes, icon: <PotholeIcon />, color: '#e74c3c' },
        { type: 'Garbage', count: data.garbage, icon: <GarbageIcon />, color: '#27ae60' },
        { type: 'Street Lights', count: data.streetLights, icon: <StreetLightIcon />, color: '#f39c12' },
        { type: 'Water Supply', count: data.waterSupply, icon: <WaterSupplyIcon />, color: '#3498db' },
    ];

    const maxCount = Math.max(...issueDistribution.map(i => i.count));

    return (
        <div className="ward-dashboard-page">
            {/* Hero Banner */}
            <section className="ward-hero">
                <div className="container">
                    <div className="ward-hero-content">
                        <div className="ward-hero-text">
                            <h1>Ward Dashboard</h1>
                            <p>Monitor and analyze civic issues across Vadodara's administrative wards</p>
                        </div>
                        <div className="ward-selector-hero">
                            <label>SELECT WARD</label>
                            <select
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                                className="ward-select"
                            >
                                {Array.from({ length: 19 }, (_, i) => (
                                    <option key={i + 1} value={String(i + 1)}>Ward {i + 1}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Overview */}
            <section className="ward-stats-section">
                <div className="container">
                    <div className="ward-stats-grid">
                        <div className="ward-stat-card-main">
                            <span className="stat-label">TOTAL ISSUES</span>
                            <span className="stat-value">{data.totalIssues}</span>
                        </div>
                        <div className="ward-stat-card-main green">
                            <span className="stat-label">RESOLVED</span>
                            <span className="stat-value">{data.resolved}</span>
                        </div>
                        <div className="ward-stat-card-main orange">
                            <span className="stat-label">PENDING</span>
                            <span className="stat-value">{data.pending}</span>
                        </div>
                        <div className="ward-stat-card-main blue">
                            <span className="stat-label">RESOLUTION RATE</span>
                            <span className="stat-value">{data.resolutionRate}%</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="ward-content-section">
                <div className="container">
                    <div className="ward-content-grid">
                        {/* Issue Distribution */}
                        <div className="ward-card">
                            <h3 className="card-title">Issue Distribution</h3>
                            <div className="distribution-list">
                                {issueDistribution.map((issue, index) => (
                                    <div key={index} className="distribution-item">
                                        <div className="distribution-header">
                                            <span className="distribution-icon" style={{ color: issue.color }}>
                                                {issue.icon}
                                            </span>
                                            <span className="distribution-type">{issue.type}</span>
                                            <span className="distribution-count">{issue.count}</span>
                                        </div>
                                        <div className="distribution-bar">
                                            <div
                                                className="distribution-fill"
                                                style={{
                                                    width: `${(issue.count / maxCount) * 100}%`,
                                                    background: issue.color
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ward Map Placeholder */}
                        <div className="ward-card map-card">
                            <h3 className="card-title">Ward {selectedWard} Map</h3>
                            <div className="map-placeholder">
                                <div className="map-content">
                                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                                        <line x1="8" y1="2" x2="8" y2="18"></line>
                                        <line x1="16" y1="6" x2="16" y2="22"></line>
                                    </svg>
                                    <p>Interactive ward map</p>
                                    <span>Ward {selectedWard} - Vadodara</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Issues Table */}
                    <div className="ward-card recent-issues">
                        <div className="card-header">
                            <h3 className="card-title">Recent Issues in Ward {selectedWard}</h3>
                            <button className="download-btn">
                                <DownloadIcon /> Export CSV
                            </button>
                        </div>
                        <div className="table-container">
                            <table className="issues-table">
                                <thead>
                                    <tr>
                                        <th>Complaint ID</th>
                                        <th>Type</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentIssues.map((issue, index) => (
                                        <tr key={index}>
                                            <td className="complaint-id">{issue.id}</td>
                                            <td>{issue.type}</td>
                                            <td>{issue.location}</td>
                                            <td>
                                                <span className={`status-badge ${issue.status.toLowerCase().replace(' ', '-')}`}>
                                                    {issue.status}
                                                </span>
                                            </td>
                                            <td>{issue.date}</td>
                                            <td>
                                                <button className="view-btn">
                                                    View <ChevronRightIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default WardDashboard;

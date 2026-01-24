import {
    ChartIcon,
    CheckCircleIcon,
    ClockIcon,
    AlertCircleIcon,
    TrophyIcon,
    FileIcon,
    DownloadIcon
} from '../components/Icons';
import './Analytics.css';

// Additional icons for analytics
const BarChartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
);

const TrendUpIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

const Analytics = () => {
    const overviewStats = [
        { label: 'Total Issues', value: '12,842', change: '+12%', positive: true, icon: <BarChartIcon /> },
        { label: 'Resolved', value: '11,594', change: '+18%', positive: true, icon: <CheckCircleIcon /> },
        { label: 'Pending', value: '1,248', change: '-5%', positive: true, icon: <ClockIcon /> },
        { label: 'Avg Resolution', value: '3.4 Days', change: '-10%', positive: true, icon: <TrendUpIcon /> },
    ];

    const monthlyData = [
        { month: 'Jan', issues: 980, resolved: 920 },
        { month: 'Feb', issues: 1100, resolved: 1050 },
        { month: 'Mar', issues: 1250, resolved: 1180 },
        { month: 'Apr', issues: 1150, resolved: 1100 },
        { month: 'May', issues: 1320, resolved: 1250 },
        { month: 'Jun', issues: 1180, resolved: 1150 },
        { month: 'Jul', issues: 1420, resolved: 1380 },
        { month: 'Aug', issues: 1280, resolved: 1220 },
        { month: 'Sep', issues: 1350, resolved: 1300 },
        { month: 'Oct', issues: 1200, resolved: 1150 },
        { month: 'Nov', issues: 1080, resolved: 1040 },
        { month: 'Dec', issues: 1050, resolved: 1000 },
    ];

    const issueCategories = [
        { category: 'Potholes', count: 3245, percentage: 25.3 },
        { category: 'Garbage', count: 4120, percentage: 32.1 },
        { category: 'Street Lights', count: 1856, percentage: 14.5 },
        { category: 'Water Supply', count: 1423, percentage: 11.1 },
        { category: 'Road Damage', count: 1198, percentage: 9.3 },
        { category: 'Others', count: 1000, percentage: 7.7 },
    ];

    const wardPerformance = [
        { ward: 'Ward 1', resolved: 95, pending: 32 },
        { ward: 'Ward 2', resolved: 88, pending: 45 },
        { ward: 'Ward 3', resolved: 92, pending: 28 },
        { ward: 'Ward 4', resolved: 78, pending: 56 },
        { ward: 'Ward 5', resolved: 85, pending: 42 },
    ];

    const maxIssues = Math.max(...monthlyData.map(d => d.issues));

    return (
        <div className="analytics-page">
            {/* Hero Banner */}
            <section className="analytics-hero">
                <div className="container">
                    <h1>Analytics Dashboard</h1>
                    <p>Comprehensive insights and performance metrics for Vadodara's civic management</p>
                </div>
            </section>

            {/* Overview Stats */}
            <section className="overview-section">
                <div className="container">
                    <div className="overview-grid">
                        {overviewStats.map((stat, index) => (
                            <div key={index} className="overview-card">
                                <div className="overview-icon">{stat.icon}</div>
                                <div className="overview-content">
                                    <span className="overview-label">{stat.label}</span>
                                    <div className="overview-value-row">
                                        <span className="overview-value">{stat.value}</span>
                                        <span className={`overview-change ${stat.positive ? 'positive' : 'negative'}`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Charts Section */}
            <section className="charts-section">
                <div className="container">
                    <div className="charts-grid">
                        {/* Monthly Trend */}
                        <div className="chart-card">
                            <h3 className="chart-title">Monthly Issue Trend</h3>
                            <div className="chart-container">
                                <div className="bar-chart">
                                    {monthlyData.map((data, index) => (
                                        <div key={index} className="bar-group">
                                            <div className="bars">
                                                <div
                                                    className="bar issues"
                                                    style={{ height: `${(data.issues / maxIssues) * 100}%` }}
                                                    title={`Issues: ${data.issues}`}
                                                ></div>
                                                <div
                                                    className="bar resolved"
                                                    style={{ height: `${(data.resolved / maxIssues) * 100}%` }}
                                                    title={`Resolved: ${data.resolved}`}
                                                ></div>
                                            </div>
                                            <span className="bar-label">{data.month}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="chart-legend">
                                    <span className="legend-item"><span className="dot issues"></span> Issues</span>
                                    <span className="legend-item"><span className="dot resolved"></span> Resolved</span>
                                </div>
                            </div>
                        </div>

                        {/* Issue Categories */}
                        <div className="chart-card">
                            <h3 className="chart-title">Issue Distribution</h3>
                            <div className="category-list">
                                {issueCategories.map((item, index) => (
                                    <div key={index} className="category-item">
                                        <div className="category-header">
                                            <span className="category-name">{item.category}</span>
                                            <span className="category-count">{item.count.toLocaleString()}</span>
                                        </div>
                                        <div className="category-bar">
                                            <div
                                                className="category-fill"
                                                style={{ width: `${item.percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="category-percentage">{item.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ward Performance */}
            <section className="performance-section">
                <div className="container">
                    <h2 className="section-title">Ward Performance Comparison</h2>
                    <div className="performance-grid">
                        <div className="performance-table-container">
                            <table className="performance-table">
                                <thead>
                                    <tr>
                                        <th>Ward</th>
                                        <th>Resolved</th>
                                        <th>Pending</th>
                                        <th>Resolution Rate</th>
                                        <th>Performance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wardPerformance.map((ward, index) => {
                                        const rate = Math.round((ward.resolved / (ward.resolved + ward.pending)) * 100);
                                        return (
                                            <tr key={index}>
                                                <td className="ward-name">{ward.ward}</td>
                                                <td className="resolved-count">{ward.resolved}</td>
                                                <td className="pending-count">{ward.pending}</td>
                                                <td>{rate}%</td>
                                                <td>
                                                    <div className="performance-bar">
                                                        <div
                                                            className="performance-fill"
                                                            style={{ width: `${rate}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Quick Insights */}
                        <div className="insights-card">
                            <h3><TrendUpIcon /> Quick Insights</h3>
                            <div className="insights-list">
                                <div className="insight-item">
                                    <span className="insight-icon"><TrophyIcon /></span>
                                    <div>
                                        <strong>Best Performing Ward</strong>
                                        <p>Ward 1 with 95% resolution rate</p>
                                    </div>
                                </div>
                                <div className="insight-item">
                                    <span className="insight-icon"><AlertCircleIcon /></span>
                                    <div>
                                        <strong>Needs Attention</strong>
                                        <p>Ward 4 has highest pending issues</p>
                                    </div>
                                </div>
                                <div className="insight-item">
                                    <span className="insight-icon"><ChartIcon /></span>
                                    <div>
                                        <strong>Top Issue Category</strong>
                                        <p>Garbage collection (32.1%)</p>
                                    </div>
                                </div>
                                <div className="insight-item">
                                    <span className="insight-icon"><ClockIcon /></span>
                                    <div>
                                        <strong>Average Resolution</strong>
                                        <p>3.4 days (improved by 10%)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Download Reports */}
            <section className="reports-section">
                <div className="container">
                    <div className="reports-card">
                        <div className="reports-content">
                            <h2>Download Detailed Reports</h2>
                            <p>Get comprehensive analytics reports in various formats</p>
                        </div>
                        <div className="reports-actions">
                            <button className="report-btn pdf">
                                <FileIcon /> PDF Report
                            </button>
                            <button className="report-btn excel">
                                <ChartIcon /> Excel Report
                            </button>
                            <button className="report-btn csv">
                                <DownloadIcon /> CSV Data
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Analytics;

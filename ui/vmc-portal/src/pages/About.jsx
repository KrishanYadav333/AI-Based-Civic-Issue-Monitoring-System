import { Link } from 'react-router-dom';
import {
    AIIcon,
    GeoFenceIcon,
    MonitoringIcon,
    AnalyticsIcon,
    TeamIcon,
    CitizenIcon
} from '../components/Icons';
import './About.css';

const About = () => {
    const features = [
        {
            icon: <AIIcon />,
            title: 'AI-Powered Detection',
            description: 'Advanced machine learning algorithms automatically identify civic issues from geo-fenced imagery and citizen reports.'
        },
        {
            icon: <GeoFenceIcon />,
            title: 'Geo-Fencing Technology',
            description: 'Precise location tracking ensures issues are mapped to exact administrative wards for efficient resolution.'
        },
        {
            icon: <MonitoringIcon />,
            title: 'Real-Time Monitoring',
            description: '24/7 continuous monitoring with real-time updates on issue status, resolution progress, and field team deployment.'
        },
        {
            icon: <AnalyticsIcon />,
            title: 'Data Analytics',
            description: 'Comprehensive dashboards and reports for data-driven decision making and resource allocation.'
        },
        {
            icon: <TeamIcon />,
            title: 'Field Team Integration',
            description: 'Mobile app integration for field engineers to receive assignments, update status, and document resolutions.'
        },
        {
            icon: <CitizenIcon />,
            title: 'Citizen Engagement',
            description: 'Easy-to-use complaint submission, tracking, and feedback system for enhanced citizen participation.'
        }
    ];

    const stats = [
        { value: '19', label: 'Administrative Wards' },
        { value: '248', label: 'Active Engineers' },
        { value: '92%', label: 'Resolution Rate' },
        { value: '24/7', label: 'Monitoring' }
    ];

    return (
        <div className="about-page">
            {/* Hero Banner */}
            <section className="about-hero">
                <div className="container">
                    <h1>About VMC System</h1>
                    <p>AI-Enhanced Civic Issue Monitoring for a Smarter Vadodara</p>
                </div>
            </section>

            {/* Introduction */}
            <section className="about-intro">
                <div className="container">
                    <div className="intro-content">
                        <div className="intro-text">
                            <h2 className="section-title">Our Mission</h2>
                            <p>
                                The AI-Based Civic Issue Monitoring System is a flagship initiative of Vadodara Municipal Corporation
                                designed to revolutionize how civic issues are identified, tracked, and resolved across the city.
                            </p>
                            <p>
                                By leveraging cutting-edge artificial intelligence, geo-fencing technology, and real-time data analytics,
                                we aim to create a proactive approach to urban management that ensures faster response times,
                                improved resource allocation, and enhanced citizen satisfaction.
                            </p>
                            <p>
                                Our system covers all 19 administrative wards of Vadodara, providing comprehensive monitoring
                                and management capabilities for various civic concerns including potholes, garbage accumulation,
                                debris, stray cattle, damaged roads, and open manholes.
                            </p>
                        </div>
                        <div className="intro-stats">
                            {stats.map((stat, index) => (
                                <div key={index} className="intro-stat-card">
                                    <span className="stat-value">{stat.value}</span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="about-features">
                <div className="container">
                    <h2 className="section-title">Key Features</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="about-process">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <div className="process-steps">
                        <div className="process-step">
                            <div className="step-number">1</div>
                            <h3>Issue Detection</h3>
                            <p>AI algorithms analyze images and citizen reports to identify civic issues automatically.</p>
                        </div>
                        <div className="process-connector"></div>
                        <div className="process-step">
                            <div className="step-number">2</div>
                            <h3>Classification & Prioritization</h3>
                            <p>Issues are categorized and prioritized based on severity, location, and public impact.</p>
                        </div>
                        <div className="process-connector"></div>
                        <div className="process-step">
                            <div className="step-number">3</div>
                            <h3>Team Assignment</h3>
                            <p>Field engineers are automatically assigned based on location, expertise, and workload.</p>
                        </div>
                        <div className="process-connector"></div>
                        <div className="process-step">
                            <div className="step-number">4</div>
                            <h3>Resolution & Verification</h3>
                            <p>Teams resolve issues and submit verification with photos for quality assurance.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta">
                <div className="container">
                    <h2>Ready to Report an Issue?</h2>
                    <p>Help us keep Vadodara clean and well-maintained by reporting civic issues in your area.</p>
                    <Link to="/issue-reporting" className="btn btn-cta">Report Issue Now</Link>
                </div>
            </section>
        </div>
    );
};

export default About;

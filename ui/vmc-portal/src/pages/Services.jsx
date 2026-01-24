import { Link } from 'react-router-dom';
import {
    PotholeIcon,
    GarbageIcon,
    DebrisIcon,
    StrayCattleIcon,
    StreetLightIcon,
    WaterSupplyIcon,
    ManholeIcon,
    BrokenRoadIcon,
    ReportIcon,
    TrackStatusIcon,
    ChartIcon,
    MapIcon,
    PhoneIcon,
    MailIcon,
    ChevronRightIcon
} from '../components/Icons';
import './Services.css';

// Tree icon for service
const TreeIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22v-7"></path>
        <path d="M9 22h6"></path>
        <path d="M12 15l-5-5h3l-4-5h12l-4 5h3l-5 5z"></path>
    </svg>
);

const Services = () => {
    const services = [
        {
            icon: <PotholeIcon />,
            title: 'Pothole Reporting',
            description: 'Report potholes and road damage for immediate attention and repairs.',
            priority: 'High Priority',
            priorityClass: 'high'
        },
        {
            icon: <GarbageIcon />,
            title: 'Garbage Collection',
            description: 'Request garbage pickup or report irregular collection in your area.',
            priority: 'Regular Service',
            priorityClass: 'medium'
        },
        {
            icon: <DebrisIcon />,
            title: 'Debris Removal',
            description: 'Report construction debris, fallen trees, or other obstructions.',
            priority: 'Medium Priority',
            priorityClass: 'medium'
        },
        {
            icon: <StrayCattleIcon />,
            title: 'Stray Animal Control',
            description: 'Report stray cattle or animals causing public inconvenience.',
            priority: 'High Priority',
            priorityClass: 'high'
        },
        {
            icon: <StreetLightIcon />,
            title: 'Street Light Issues',
            description: 'Report non-functional or damaged street lights in your locality.',
            priority: 'Safety Issue',
            priorityClass: 'high'
        },
        {
            icon: <WaterSupplyIcon />,
            title: 'Water Supply',
            description: 'Report water supply issues, leakages, or contamination concerns.',
            priority: 'Essential Service',
            priorityClass: 'high'
        },
        {
            icon: <TreeIcon />,
            title: 'Tree Maintenance',
            description: 'Request tree trimming or report dangerous/fallen branches.',
            priority: 'Medium Priority',
            priorityClass: 'medium'
        },
        {
            icon: <BrokenRoadIcon />,
            title: 'Road Damage',
            description: 'Report broken roads, missing dividers, or damaged signage.',
            priority: 'High Priority',
            priorityClass: 'high'
        },
        {
            icon: <ManholeIcon />,
            title: 'Open Manholes',
            description: 'Report open or damaged manholes posing safety risks.',
            priority: 'Emergency',
            priorityClass: 'emergency'
        }
    ];

    const onlineServices = [
        { icon: <ReportIcon />, title: 'File New Complaint', link: '/issue-reporting' },
        { icon: <TrackStatusIcon />, title: 'Track Complaint Status', link: '/track-status' },
        { icon: <ChartIcon />, title: 'View Analytics', link: '/analytics' },
        { icon: <MapIcon />, title: 'Ward Map', link: '/ward-dashboard' },
    ];

    return (
        <div className="services-page">
            {/* Hero Banner */}
            <section className="services-hero">
                <div className="container">
                    <h1>Citizen Services</h1>
                    <p>Access a wide range of civic services and report issues in your area</p>
                </div>
            </section>

            {/* Online Services */}
            <section className="online-services">
                <div className="container">
                    <div className="online-services-grid">
                        {onlineServices.map((service, index) => (
                            <Link to={service.link} key={index} className="online-service-card">
                                <span className="service-icon">{service.icon}</span>
                                <span className="service-title">{service.title}</span>
                                <ChevronRightIcon />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Services */}
            <section className="all-services">
                <div className="container">
                    <h2 className="section-title">Available Services</h2>
                    <div className="services-grid">
                        {services.map((service, index) => (
                            <div key={index} className="service-card">
                                <div className="service-card-icon">{service.icon}</div>
                                <div className="service-card-content">
                                    <h3>{service.title}</h3>
                                    <p>{service.description}</p>
                                    <span className={`service-priority ${service.priorityClass}`}>
                                        {service.priority}
                                    </span>
                                </div>
                                <Link to="/issue-reporting" className="service-action">
                                    Report Now <ChevronRightIcon />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Help Section */}
            <section className="services-help">
                <div className="container">
                    <div className="help-content">
                        <div className="help-text">
                            <h2>Need Assistance?</h2>
                            <p>Our support team is available 24/7 to help you with any queries or issues.</p>
                            <div className="help-contact">
                                <div className="help-item">
                                    <span className="help-icon">
                                        <PhoneIcon />
                                    </span>
                                    <div>
                                        <span className="label">Helpline (24x7)</span>
                                        <span className="value">1800 233 0263</span>
                                    </div>
                                </div>
                                <div className="help-item">
                                    <span className="help-icon">
                                        <MailIcon />
                                    </span>
                                    <div>
                                        <span className="label">Email Support</span>
                                        <span className="value">it-cell@vmc.gov.in</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Services;

import { useState } from 'react';
import {
    PhoneIcon,
    MailIcon,
    LocationIcon,
    ClockIcon,
    ChevronRightIcon
} from '../components/Icons';
import './Contact.css';

// Map icon for contact page
const MapPinIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Contact form submitted:', formData);
        alert('Thank you for your message! We will get back to you soon.');
    };

    const contactInfo = [
        {
            icon: <LocationIcon />,
            title: 'Address',
            lines: ['Khanderao Market Building', 'Rajmahal Road, Vadodara - 390209', 'Gujarat, India']
        },
        {
            icon: <PhoneIcon />,
            title: 'Phone',
            lines: ['Helpline (24×7): 1800 233 0263', 'Office: +91 265 2431891', 'Fax: +91 265 2431890']
        },
        {
            icon: <MailIcon />,
            title: 'Email',
            lines: ['it-cell@vmc.gov.in', 'support@vmc.gov.in', 'info@vmc.gov.in']
        },
        {
            icon: <ClockIcon />,
            title: 'Working Hours',
            lines: ['Monday - Saturday', '10:00 AM - 6:00 PM', 'Emergency: 24×7']
        }
    ];

    const departments = [
        { name: 'Engineering Department', phone: '+91 265 2431001', email: 'engineering@vmc.gov.in' },
        { name: 'Health Department', phone: '+91 265 2431002', email: 'health@vmc.gov.in' },
        { name: 'Solid Waste Management', phone: '+91 265 2431003', email: 'swm@vmc.gov.in' },
        { name: 'Water Supply Department', phone: '+91 265 2431004', email: 'water@vmc.gov.in' },
        { name: 'Street Light Department', phone: '+91 265 2431005', email: 'streetlight@vmc.gov.in' },
    ];

    return (
        <div className="contact-page">
            {/* Hero Banner */}
            <section className="contact-hero">
                <div className="container">
                    <h1>Contact Us</h1>
                    <p>We're here to help. Reach out to us for any queries or assistance.</p>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="contact-info-section">
                <div className="container">
                    <div className="contact-info-grid">
                        {contactInfo.map((info, index) => (
                            <div key={index} className="contact-info-card">
                                <div className="info-icon">{info.icon}</div>
                                <h3>{info.title}</h3>
                                {info.lines.map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Departments */}
            <section className="contact-main-section">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Form */}
                        <div className="contact-form-card">
                            <h2>Send us a Message</h2>
                            <p className="form-desc">Fill out the form below and we'll get back to you as soon as possible.</p>

                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="10-digit mobile number"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Subject *</label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Subject</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="complaint">Complaint Status</option>
                                            <option value="feedback">Feedback</option>
                                            <option value="technical">Technical Support</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Message *</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Type your message here..."
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary submit-btn">
                                    Send Message
                                </button>
                            </form>
                        </div>

                        {/* Department Contacts */}
                        <div className="departments-card">
                            <h2>Department Contacts</h2>
                            <p className="dept-desc">For specific queries, contact the relevant department directly.</p>

                            <div className="departments-list">
                                {departments.map((dept, index) => (
                                    <div key={index} className="department-item">
                                        <h4>{dept.name}</h4>
                                        <div className="dept-contact">
                                            <span className="contact-line">
                                                <PhoneIcon /> {dept.phone}
                                            </span>
                                            <span className="contact-line">
                                                <MailIcon /> {dept.email}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="emergency-box">
                                <h3><PhoneIcon /> Emergency Helpline</h3>
                                <p className="emergency-number">1800 233 0263</p>
                                <p className="emergency-note">Available 24 hours, 7 days a week</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="map-section">
                <div className="container">
                    <h2 className="section-title">Find Us</h2>
                    <div className="map-container">
                        <div className="map-placeholder">
                            <div className="map-content">
                                <span className="map-icon"><MapPinIcon /></span>
                                <h3>Vadodara Municipal Corporation</h3>
                                <p>Khanderao Market Building, Rajmahal Road</p>
                                <p>Vadodara - 390209, Gujarat, India</p>
                                <a
                                    href="https://maps.google.com/?q=Vadodara+Municipal+Corporation"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline map-btn"
                                >
                                    Open in Google Maps <ChevronRightIcon />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;

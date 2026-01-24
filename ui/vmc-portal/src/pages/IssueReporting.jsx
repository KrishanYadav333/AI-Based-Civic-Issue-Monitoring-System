import { useState } from 'react';
import {
    PotholeIcon,
    GarbageIcon,
    DebrisIcon,
    StrayCattleIcon,
    StreetLightIcon,
    WaterSupplyIcon,
    ManholeIcon,
    BrokenRoadIcon,
    LocationIcon,
    CameraIcon,
    PhoneIcon,
    ClockIcon
} from '../components/Icons';
import './IssueReporting.css';

// Other icon for general issues
const OtherIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);

const IssueReporting = () => {
    const [formData, setFormData] = useState({
        issueType: '',
        description: '',
        location: '',
        ward: '',
        landmark: '',
        name: '',
        phone: '',
        email: '',
        image: null
    });

    const issueTypes = [
        { id: 'pothole', label: 'Pothole', icon: <PotholeIcon /> },
        { id: 'garbage', label: 'Garbage', icon: <GarbageIcon /> },
        { id: 'debris', label: 'Debris', icon: <DebrisIcon /> },
        { id: 'stray-cattle', label: 'Stray Cattle', icon: <StrayCattleIcon /> },
        { id: 'street-light', label: 'Street Light', icon: <StreetLightIcon /> },
        { id: 'water-supply', label: 'Water Supply', icon: <WaterSupplyIcon /> },
        { id: 'open-manhole', label: 'Open Manhole', icon: <ManholeIcon /> },
        { id: 'road-damage', label: 'Road Damage', icon: <BrokenRoadIcon /> },
        { id: 'other', label: 'Other', icon: <OtherIcon /> },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Issue reported successfully! Your complaint ID is VMC-2024-' + Math.floor(Math.random() * 10000));
    };

    return (
        <div className="issue-reporting-page">
            {/* Hero Banner */}
            <section className="reporting-hero">
                <div className="container">
                    <h1>Report an Issue</h1>
                    <p>Help us keep Vadodara clean and safe by reporting civic issues in your area</p>
                </div>
            </section>

            {/* Reporting Form */}
            <section className="reporting-form-section">
                <div className="container">
                    <div className="form-layout">
                        {/* Form */}
                        <div className="form-container">
                            <form onSubmit={handleSubmit}>
                                {/* Issue Type Selection */}
                                <div className="form-group">
                                    <label className="form-label">Select Issue Type *</label>
                                    <div className="issue-type-grid">
                                        {issueTypes.map((type) => (
                                            <label
                                                key={type.id}
                                                className={`issue-type-card ${formData.issueType === type.id ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="issueType"
                                                    value={type.id}
                                                    checked={formData.issueType === type.id}
                                                    onChange={handleChange}
                                                />
                                                <span className="type-icon">{type.icon}</span>
                                                <span className="type-label">{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="form-group">
                                    <label className="form-label">Description *</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe the issue in detail..."
                                        rows="4"
                                        required
                                    ></textarea>
                                </div>

                                {/* Location Details */}
                                <div className="form-section">
                                    <h3 className="form-section-title">Location Details</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Address/Location *</label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="Enter complete address"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Ward *</label>
                                            <select
                                                name="ward"
                                                value={formData.ward}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Ward</option>
                                                {Array.from({ length: 19 }, (_, i) => (
                                                    <option key={i + 1} value={i + 1}>Ward {i + 1}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Nearby Landmark</label>
                                        <input
                                            type="text"
                                            name="landmark"
                                            value={formData.landmark}
                                            onChange={handleChange}
                                            placeholder="Any nearby landmark for easy identification"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <button type="button" className="location-btn">
                                            <LocationIcon /> Use Current Location
                                        </button>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="form-group">
                                    <label className="form-label">Upload Photo</label>
                                    <div className="upload-area">
                                        <div className="upload-content">
                                            <span className="upload-icon"><CameraIcon /></span>
                                            <p>Drag & drop an image or click to browse</p>
                                            <small>Supports: JPG, PNG, WEBP (Max 5MB)</small>
                                        </div>
                                        <input type="file" accept="image/*" />
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="form-section">
                                    <h3 className="form-section-title">Your Contact Information</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone Number *</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="10-digit mobile number"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary submit-btn">
                                        Submit Report
                                    </button>
                                    <button type="reset" className="btn btn-outline reset-btn">
                                        Reset Form
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Sidebar */}
                        <div className="form-sidebar">
                            <div className="sidebar-card">
                                <h3><ReportGuidelinesIcon /> Reporting Guidelines</h3>
                                <ul>
                                    <li>Provide accurate location details for faster resolution</li>
                                    <li>Upload a clear photo of the issue</li>
                                    <li>Include any relevant landmarks</li>
                                    <li>Ensure your contact information is correct</li>
                                </ul>
                            </div>

                            <div className="sidebar-card">
                                <h3><ClockIcon /> Response Time</h3>
                                <div className="response-items">
                                    <div className="response-item">
                                        <span className="priority high">High Priority</span>
                                        <span className="time">24-48 hours</span>
                                    </div>
                                    <div className="response-item">
                                        <span className="priority medium">Medium Priority</span>
                                        <span className="time">3-5 days</span>
                                    </div>
                                    <div className="response-item">
                                        <span className="priority low">Low Priority</span>
                                        <span className="time">7-10 days</span>
                                    </div>
                                </div>
                            </div>

                            <div className="sidebar-card highlight">
                                <h3><PhoneIcon /> Emergency Helpline</h3>
                                <p className="emergency-number">1800 233 0263</p>
                                <p className="emergency-note">Available 24×7 for urgent issues</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Guidelines icon
const ReportGuidelinesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
);

export default IssueReporting;

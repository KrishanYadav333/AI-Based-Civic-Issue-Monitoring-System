import { Link } from 'react-router-dom';
import { PhoneIcon, MailIcon, GlobeIcon, ChevronRightIcon } from './Icons';
import './Footer.css';

// VMC Footer Logo - simplified version
const VMCFooterLogo = () => (
    <svg width="44" height="44" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <path d="M50 20 L65 32 L65 45 L58 45 L58 36 L50 28 L42 36 L42 45 L35 45 L35 32 Z" fill="rgba(255,255,255,0.9)" />
        <rect x="40" y="42" width="20" height="24" rx="2" fill="rgba(255,255,255,0.9)" />
        <rect x="44" y="46" width="5" height="6" rx="1" fill="#2d3948" />
        <rect x="51" y="46" width="5" height="6" rx="1" fill="#2d3948" />
        <rect x="46" y="55" width="8" height="11" rx="1" fill="#2d3948" />
        <text x="50" y="80" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="9" fontWeight="bold">VMC</text>
    </svg>
);

// Social Icons
const FacebookIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const TwitterIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z" />
    </svg>
);

const InstagramIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const YoutubeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#2d3948" />
    </svg>
);

const Footer = () => {
    return (
        <footer className="footer">
            {/* Animated divider */}
            <div className="footer-divider">
                <div className="divider-animation"></div>
            </div>

            <div className="footer-main">
                <div className="container footer-content">
                    {/* Organization Info */}
                    <div className="footer-org">
                        <div className="footer-logo-section">
                            <VMCFooterLogo />
                            <div className="footer-org-text">
                                <h3>Vadodara Municipal Corporation</h3>
                            </div>
                        </div>
                        <address className="footer-address">
                            Khanderao Market Building,<br />
                            Rajmahal Road, Vadodara – 390209,<br />
                            Gujarat, India.
                        </address>
                        <div className="social-icons">
                            <a href="#" className="social-icon" aria-label="Facebook"><FacebookIcon /></a>
                            <a href="#" className="social-icon" aria-label="Twitter"><TwitterIcon /></a>
                            <a href="#" className="social-icon" aria-label="Instagram"><InstagramIcon /></a>
                            <a href="#" className="social-icon" aria-label="YouTube"><YoutubeIcon /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links">
                        <h4><span className="accent-bar"></span>QUICK LINKS</h4>
                        <ul>
                            <li><Link to="/"><ChevronRightIcon /> VMC Official Website</Link></li>
                            <li><Link to="/"><ChevronRightIcon /> Smart City Vadodara</Link></li>
                            <li><Link to="/"><ChevronRightIcon /> Digital India</Link></li>
                            <li><Link to="/"><ChevronRightIcon /> MyGov India</Link></li>
                            <li><Link to="/"><ChevronRightIcon /> Gujarat State Portal</Link></li>
                            <li><Link to="/"><ChevronRightIcon /> Sitemap</Link></li>
                        </ul>
                    </div>

                    {/* Contact Support */}
                    <div className="footer-contact">
                        <h4><span className="accent-bar"></span>CONTACT SUPPORT</h4>
                        <div className="contact-item">
                            <span className="contact-icon"><PhoneIcon /></span>
                            <div>
                                <span className="contact-label">Helpline (24×7)</span>
                                <a href="tel:18002330263" className="contact-value highlight">1800 233 0263</a>
                            </div>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon"><MailIcon /></span>
                            <div>
                                <span className="contact-label">Email Support</span>
                                <a href="mailto:it-cell@vmc.gov.in" className="contact-value highlight">it-cell@vmc.gov.in</a>
                            </div>
                        </div>
                    </div>

                    {/* Important Info */}
                    <div className="footer-info">
                        <h4><span className="accent-bar"></span>IMPORTANT INFO</h4>
                        <div className="info-box">
                            <p>
                                This portal is an <strong>AI-enhanced monitoring platform</strong> designed to support VMC's
                                engineers in identifying civic distress automatically via geo-fenced imagery.
                            </p>
                            <p className="disclaimer">
                                <strong>Disclaimer:</strong> Real-time data processing may have a latency of up to 15 minutes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <div className="container footer-bottom-content">
                    <p className="copyright">
                        © 2024 Vadodara Municipal Corporation. All Rights Reserved.
                    </p>
                    <div className="footer-bottom-links">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Use</Link>
                        <Link to="/accessibility">Accessibility Statement</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

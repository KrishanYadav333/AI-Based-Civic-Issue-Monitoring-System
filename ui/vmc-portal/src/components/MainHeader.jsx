import './MainHeader.css';

// VMC Emblem Logo Component - Government seal style matching the reference
const VMCEmblem = () => (
    <div className="vmc-emblem">
        <svg width="52" height="52" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="emblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#0a2647', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#144272', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            {/* Outer circle */}
            <circle cx="50" cy="50" r="47" fill="none" stroke="#0a2647" strokeWidth="3" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#144272" strokeWidth="1" />

            {/* Building/Temple icon */}
            <path d="M50 18 L68 32 L68 45 L62 45 L62 36 L50 27 L38 36 L38 45 L32 45 L32 32 Z" fill="#0a2647" />
            <rect x="38" y="42" width="24" height="26" rx="2" fill="#0a2647" />

            {/* Windows */}
            <rect x="42" y="46" width="6" height="7" rx="1" fill="#fff" />
            <rect x="52" y="46" width="6" height="7" rx="1" fill="#fff" />

            {/* Door */}
            <rect x="45" y="57" width="10" height="11" rx="1" fill="#fff" />

            {/* VMC Text */}
            <text x="50" y="82" textAnchor="middle" fill="#0a2647" fontSize="10" fontWeight="bold" fontFamily="Arial">VMC</text>
        </svg>
    </div>
);

const MainHeader = () => {
    return (
        <header className="main-header">
            <div className="container main-header-content">
                <div className="header-left">
                    <VMCEmblem />
                    <div className="header-text">
                        <h1 className="header-title">AI-BASED CIVIC ISSUE MONITORING SYSTEM</h1>
                        <p className="header-subtitle">An Initiative of Vadodara Municipal Corporation</p>
                    </div>
                </div>
                <div className="header-badges">
                    <span className="badge badge-city">SMART CITY</span>
                    <span className="badge badge-digital">DIGITAL VADODARA</span>
                    <span className="badge badge-vmc">VMC INITIATIVE</span>
                </div>
            </div>
        </header>
    );
};

export default MainHeader;

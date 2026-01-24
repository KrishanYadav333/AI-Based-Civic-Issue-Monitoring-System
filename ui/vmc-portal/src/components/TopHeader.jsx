import { GlobeIcon, EyeIcon, AccessibilityIcon } from './Icons';
import './TopHeader.css';

const TopHeader = () => {
  return (
    <div className="top-header">
      <div className="container top-header-content">
        <div className="top-header-left">
          <span className="org-name">Vadodara Municipal Corporation</span>
          <div className="language-selector">
            <GlobeIcon />
            <span className="lang-active">English</span>
            <span className="lang-divider">|</span>
            <span className="lang-option">ગુજરાતી</span>
          </div>
        </div>
        <div className="top-header-right">
          <button className="accessibility-btn" title="Contrast">
            <EyeIcon />
          </button>
          <button className="accessibility-btn font-size-btn" title="Font Size">
            <span>A</span>
          </button>
          <button className="accessibility-btn" title="Screen Reader">
            <AccessibilityIcon />
          </button>
          <a href="/help" className="top-link">Help</a>
          <a href="/contact" className="top-link">Contact</a>
          <button className="login-btn">Login</button>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;

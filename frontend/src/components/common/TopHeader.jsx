import React, { useState, useEffect } from 'react';
import { Globe, Eye, Volume2, Minus, Plus, Contrast, Download } from 'lucide-react';

const TopHeader = () => {
  const [fontSize, setFontSize] = useState(100);
  const [language, setLanguage] = useState('en');
  const [highContrast, setHighContrast] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    const savedLanguage = localStorage.getItem('language');
    const savedContrast = localStorage.getItem('highContrast');
    
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
      document.documentElement.style.fontSize = `${savedFontSize}%`;
    }
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedContrast === 'true') {
      setHighContrast(true);
      document.body.classList.add('high-contrast');
    }
  }, []);

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 10, 150);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem('fontSize', newSize);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 10, 80);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem('fontSize', newSize);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    setShowLanguageMenu(false);
  };

  const toggleHighContrast = () => {
    const newContrast = !highContrast;
    setHighContrast(newContrast);
    document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', newContrast);
  };

  const speakPage = () => {
    const text = document.body.innerText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const printPage = () => {
    window.print();
  };

  const getLanguageDisplay = () => {
    const languages = {
      'en': 'English',
      'hi': 'हिंदी',
      'gu': 'ગુજરાતી',
      'mr': 'मराठी'
    };
    return languages[language] || 'English';
  };

  return (
    <div className="bg-[#1a1a2e] py-2">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-yellow-400 focus:text-gray-900 focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>
      <div className="container mx-auto px-5">
        <div className="flex justify-between items-center">
          {/* Left Side */}
          <div className="flex items-center gap-6">
            <span className="text-white font-medium text-sm">Vadodara Municipal Corporation</span>
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 text-white/85 hover:text-white transition-colors text-sm"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{getLanguageDisplay()}</span>
              </button>
              {showLanguageMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-lg py-1 min-w-[150px] z-50">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('hi')}
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'hi' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    हिंदी
                  </button>
                  <button
                    onClick={() => handleLanguageChange('gu')}
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'gu' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    ગુજરાતી
                  </button>
                  <button
                    onClick={() => handleLanguageChange('mr')}
                    className={`w-full text-left px-4 py-2 text-sm ${language === 'mr' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    मराठी
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Accessibility Controls */}
          <div className="flex items-center gap-3">
            {/* Font Size Controls */}
            <div className="flex items-center bg-white/10 rounded">
              <button
                onClick={decreaseFontSize}
                className="p-1.5 hover:bg-white/20 transition-colors"
                aria-label="Decrease Font Size"
                title="Decrease Font Size"
              >
                <Minus className="w-3.5 h-3.5 text-white" />
              </button>
              <span className="px-2 text-white text-xs font-semibold">
                {fontSize}%
              </span>
              <button
                onClick={increaseFontSize}
                className="p-1.5 hover:bg-white/20 transition-colors"
                aria-label="Increase Font Size"
                title="Increase Font Size"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* High Contrast */}
            <button
              onClick={toggleHighContrast}
              className={`p-1.5 rounded transition-colors ${
                highContrast ? 'bg-yellow-400 text-gray-900' : 'bg-transparent text-white/85 hover:bg-white/10 hover:text-white'
              }`}
              aria-label="Toggle High Contrast"
              title="High Contrast Mode"
            >
              <Contrast className="w-3.5 h-3.5" />
            </button>

            {/* Screen Reader */}
            <button
              onClick={speakPage}
              className="p-1.5 bg-transparent text-white/85 hover:bg-white/10 hover:text-white rounded transition-colors"
              aria-label="Listen to Page"
              title="Screen Reader / Text to Speech"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            {/* Print */}
            <button
              onClick={printPage}
              className="p-1.5 bg-transparent text-white/85 hover:bg-white/10 hover:text-white rounded transition-colors"
              aria-label="Print Page"
              title="Print or Save as PDF"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <a href="/help" className="text-white/85 hover:text-white text-xs transition-colors">Help</a>
            <a href="/contact" className="text-white/85 hover:text-white text-xs transition-colors">Contact</a>
            <a href="/login" className="bg-transparent border border-white/30 text-white px-3 py-1 rounded text-xs hover:bg-white/10 transition-colors">
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;

import React, { useState, useEffect } from 'react';
import { Type, Globe, Contrast, Minus, Plus, Volume2, Download } from 'lucide-react';

const AccessibilityControls = () => {
  const [fontSize, setFontSize] = useState(100);
  const [language, setLanguage] = useState('en');
  const [highContrast, setHighContrast] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    // Load saved preferences
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

  const resetFontSize = () => {
    setFontSize(100);
    document.documentElement.style.fontSize = '100%';
    localStorage.setItem('fontSize', 100);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    // Trigger translation logic here
    document.documentElement.lang = lang;
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

  return (
    <>
      {/* Skip to Main Content - Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-yellow-400 focus:text-gray-900 focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      <div className="flex items-center gap-2">
        {/* Compact View - Icon Buttons */}
        <div className="flex items-center gap-1">
          {/* Font Size Controls */}
          <div className="flex items-center bg-white/10 rounded-lg">
            <button
              onClick={decreaseFontSize}
              className="p-2 hover:bg-white/20 rounded-l-lg transition-colors"
              aria-label="Decrease Font Size"
              title="Decrease Font Size (A-)"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={resetFontSize}
              className="px-2 py-2 hover:bg-white/20 transition-colors text-white text-xs font-semibold"
              aria-label="Reset Font Size"
              title={`Font Size: ${fontSize}%`}
            >
              {fontSize}%
            </button>
            <button
              onClick={increaseFontSize}
              className="p-2 hover:bg-white/20 rounded-r-lg transition-colors"
              aria-label="Increase Font Size"
              title="Increase Font Size (A+)"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
              aria-label="Language"
              title="Select Language"
            >
              <Globe className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-semibold uppercase">
                {language}
              </span>
            </button>
            
            {showControls && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl p-2 min-w-[200px] z-50">
                <div className="space-y-1">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
                      language === 'en' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('hi')}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
                      language === 'hi' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>
                  <button
                    onClick={() => handleLanguageChange('gu')}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
                      language === 'gu' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    ગુજરાતી (Gujarati)
                  </button>
                  <button
                    onClick={() => handleLanguageChange('mr')}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
                      language === 'mr' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    मराठी (Marathi)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={toggleHighContrast}
            className={`p-2 rounded-lg transition-colors ${
              highContrast ? 'bg-yellow-400 text-gray-900' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            aria-label="Toggle High Contrast"
            title="High Contrast Mode"
          >
            <Contrast className="w-4 h-4" />
          </button>

          {/* Screen Reader / Text to Speech */}
          <button
            onClick={speakPage}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Listen to Page"
            title="Screen Reader / Text to Speech"
          >
            <Volume2 className="w-4 h-4 text-white" />
          </button>

          {/* Print / Download */}
          <button
            onClick={printPage}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Print Page"
            title="Print or Save as PDF"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </>
  );
};

export default AccessibilityControls;

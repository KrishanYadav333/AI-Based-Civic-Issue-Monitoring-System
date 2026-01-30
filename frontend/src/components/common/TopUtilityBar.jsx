import React, { useState } from 'react';
import { Globe, PlusCircle, MinusCircle, Accessibility } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TopUtilityBar = () => {
  const [fontSize, setFontSize] = useState(16);
  const { i18n, t } = useTranslation();

  const increaseFontSize = () => {
    const newSize = Math.min(24, fontSize + 1);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(12, fontSize - 1);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
  };

  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="bg-[#003366] text-white text-[11px] md:text-xs py-1 px-4 md:px-10 flex flex-wrap justify-between items-center gap-2">
      <div className="flex items-center gap-4">
        <span className="font-semibold">{t('vmc')}</span>
        <div className="hidden md:flex items-center gap-2 border-l border-white/20 pl-4">
          <Globe size={12} />
          <button 
            onClick={() => toggleLanguage('en')}
            className={`hover:underline ${i18n.language === 'en' ? 'font-bold' : ''}`}
          >
            {t('english')}
          </button>
          <span>|</span>
          <button 
            onClick={() => toggleLanguage('gu')}
            className={`hover:underline ${i18n.language === 'gu' ? 'font-bold' : ''}`}
          >
            {t('gujarati')}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <MinusCircle 
            size={14} 
            className="cursor-pointer hover:text-blue-300" 
            onClick={decreaseFontSize} 
          />
          <span className="font-bold">A</span>
          <PlusCircle 
            size={14} 
            className="cursor-pointer hover:text-blue-300" 
            onClick={increaseFontSize} 
          />
        </div>
        <Accessibility size={14} className="cursor-pointer hover:text-blue-300" />
        <div className="hidden sm:flex items-center gap-4 border-l border-white/20 pl-4">
          <button className="hover:underline">{t('help')}</button>
          <button className="hover:underline">{t('contact')}</button>
        </div>
      </div>
    </div>
  );
};

export default TopUtilityBar;

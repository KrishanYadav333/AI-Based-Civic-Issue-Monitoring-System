import React from 'react';
import { useTranslation } from 'react-i18next';

const VMCHeader = () => {
  const { t } = useTranslation();
  return (
    <header className="bg-white border-b py-4 px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-100 border-2 border-[#003366] flex items-center justify-center rounded">
          <div className="w-full h-full flex items-center justify-center text-[#003366] font-bold text-2xl">
            VMC
          </div>
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#003366] leading-tight uppercase">
            AI-Based Civic Issue Monitoring System
          </h1>
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            An Initiative of Vadodara Municipal Corporation
          </p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        <div className="bg-blue-50 border border-blue-200 px-3 py-1 text-[10px] font-bold text-blue-700 rounded-sm">
          SMART CITY
        </div>
        <div className="bg-slate-50 border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-700 rounded-sm">
          DIGITAL VADODARA
        </div>
        <div className="bg-green-50 border border-green-200 px-3 py-1 text-[10px] font-bold text-green-700 rounded-sm">
          VMC INITIATIVE
        </div>
      </div>
    </header>
  );
};

export default VMCHeader;

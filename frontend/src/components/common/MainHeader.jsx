import React from 'react';

const VMCEmblem = () => (
  <div className="flex-shrink-0">
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
    <header className="bg-white py-3 border-b border-gray-200">
      <div className="container mx-auto px-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <VMCEmblem />
            <div className="flex flex-col">
              <h1 className="text-[1.35rem] font-bold text-[#0a2647] tracking-wide leading-tight">
                AI-BASED CIVIC ISSUE MONITORING SYSTEM
              </h1>
              <p className="text-xs text-gray-500">
                An Initiative of Vadodara Municipal Corporation
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <span className="px-4 py-2 text-[0.7rem] font-semibold rounded border-[1.5px] border-[#144272] text-[#144272] bg-white uppercase tracking-wider">
              Smart City
            </span>
            <span className="px-4 py-2 text-[0.7rem] font-semibold rounded border-[1.5px] border-[#144272] bg-[#144272] text-white uppercase tracking-wider">
              Digital Vadodara
            </span>
            <span className="px-4 py-2 text-[0.7rem] font-semibold rounded border-[1.5px] border-[#e67e22] bg-[#e67e22] text-white uppercase tracking-wider">
              VMC Initiative
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;

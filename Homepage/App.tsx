
import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  ExternalLink,
  MapPin,
  Calendar,
  AlertCircle,
  Phone,
  Mail,
  Home as HomeIcon,
  Accessibility,
  PlusCircle,
  MinusCircle,
  // Added Bell to imports
  Bell
} from 'lucide-react';
import { WARD_DATA, ISSUE_CATEGORIES, NOTICES, QUICK_TILES } from './constants';
import { WardStats } from './types';
import logo from './vmc_logo.jpg';

// Helper for dynamic colors
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'text-red-600 bg-red-50 border-red-100';
    case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    default: return 'text-green-600 bg-green-50 border-green-100';
  }
};

const App: React.FC = () => {
  const [selectedWard, setSelectedWard] = useState<WardStats>(WARD_DATA[0]);
  const [fontSize, setFontSize] = useState(16);

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ward = WARD_DATA.find(w => w.id === e.target.value);
    if (ward) setSelectedWard(ward);
  };

  return (
    <div style={{ fontSize: `${fontSize}px` }} className="min-h-screen flex flex-col">
      
      {/* 1. Top Utility Bar */}
      <div className="bg-[#003366] text-white text-[11px] md:text-xs py-1 px-4 md:px-10 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-4">
          <span className="font-semibold">Vadodara Municipal Corporation</span>
          <div className="hidden md:flex items-center gap-2 border-l border-white/20 pl-4">
            <Globe size={12} />
            <button className="hover:underline">English</button>
            <span>|</span>
            <button className="hover:underline">ગુજરાતી</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MinusCircle size={14} className="cursor-pointer" onClick={() => setFontSize(p => Math.max(12, p - 1))} />
            <span className="font-bold">A</span>
            <PlusCircle size={14} className="cursor-pointer" onClick={() => setFontSize(p => Math.min(24, p + 1))} />
          </div>
          <Accessibility size={14} className="cursor-pointer" />
          <div className="hidden sm:flex items-center gap-4 border-l border-white/20 pl-4">
            <button className="hover:underline">Help</button>
            <button className="hover:underline">Contact</button>
            <button className="bg-white text-[#003366] px-2 py-0.5 rounded font-bold hover:bg-slate-100">Login</button>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <header className="bg-white border-b py-4 px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 border-2 border-[#003366] flex items-center justify-center rounded">
            <img src={logo} alt="VMC Logo" className="w-full h-full object-cover" />
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
          <div className="bg-blue-50 border border-blue-200 px-3 py-1 text-[10px] font-bold text-blue-700 rounded-sm">SMART CITY</div>
          <div className="bg-slate-50 border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-700 rounded-sm">DIGITAL VADODARA</div>
          <div className="bg-green-50 border border-green-200 px-3 py-1 text-[10px] font-bold text-green-700 rounded-sm">VMC INITIATIVE</div>
        </div>
      </header>

      {/* 3. Navbar */}
      <nav className="bg-[#0056b3] text-white sticky top-0 z-50 shadow-lg hidden md:block">
        <ul className="flex items-center px-10">
          <li className="px-5 py-3 bg-[#003366] hover:bg-blue-900 cursor-pointer border-r border-white/10">
            <HomeIcon size={18} />
          </li>
          {['About VMC System', 'Citizen Services', 'Ward Dashboard', 'Issue Reporting', 'Analytics', 'Contact Us'].map((item) => (
            <li key={item} className="px-5 py-3 text-sm font-medium hover:bg-blue-700 cursor-pointer border-r border-white/10">
              {item}
            </li>
          ))}
          <li className="ml-auto px-5">
            <Search size={18} className="cursor-pointer" />
          </li>
        </ul>
      </nav>
      {/* Mobile Nav Trigger */}
      <div className="md:hidden bg-[#0056b3] text-white p-3 flex justify-between items-center sticky top-0 z-50">
        <span className="font-bold text-sm">Menu</span>
        <Menu size={20} />
      </div>

      {/* 4. Hero Banner */}
      <section className="bg-slate-100 flex flex-col md:flex-row min-h-[400px]">
        <div className="flex-1 p-10 md:p-20 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#003366] mb-6 leading-snug">
            Report & Monitor Civic Issues using AI
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-lg">
            AI powered detection + geo-fencing for proactive issue resolution across Vadodara's 19 administrative wards.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a
              href="http://localhost:5173/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#003366] text-white px-8 py-3 font-bold hover:bg-blue-900 transition-colors shadow-lg inline-block"
            >
              Report Issue
            </a>
            <a
              href="http://localhost:5174/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#003366] border-2 border-[#003366] px-8 py-3 font-bold hover:bg-slate-50 transition-colors inline-block"
            >
              View Ward Dashboard
            </a>
          </div>
        </div>
        <div className="flex-1 bg-slate-300 relative overflow-hidden hidden lg:block">
          <img 
            src="https://picsum.photos/seed/vadodara/800/600" 
            alt="Vadodara City" 
            className="w-full h-full object-cover grayscale-[20%] opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-transparent"></div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-[1400px] mx-auto w-full p-6 md:p-10 space-y-12">
        
        {/* 5. Quick Service Tiles */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-[#003366]"></div>
            <h3 className="text-xl font-bold text-[#003366] uppercase tracking-wide">Quick Services</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_TILES.map((tile, i) => (
              <div 
                key={i} 
                className={`p-6 border rounded-sm flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:shadow-md transition-all group ${tile.color}`}
              >
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  {React.cloneElement(tile.icon as React.ReactElement, { size: 28 })}
                </div>
                <span className="font-bold text-sm leading-tight uppercase tracking-wider">{tile.title}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* 6. Latest Updates / Notices */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded shadow-sm flex flex-col h-full">
              <div className="bg-[#003366] text-white p-4 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                  <Bell size={18} />
                  Latest Announcements
                </h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">Real-time</span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
                <ul className="space-y-4">
                  {NOTICES.map(notice => (
                    <li key={notice.id} className="border-b pb-3 last:border-0 group cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Calendar size={10} /> {notice.date}
                        </span>
                        {notice.isNew && (
                          <span className="bg-red-500 text-white text-[9px] px-1.5 rounded animate-pulse">NEW</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 font-medium group-hover:text-blue-700 transition-colors">
                        {notice.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border-t bg-slate-50 flex justify-end">
                <button className="text-xs font-bold text-[#003366] flex items-center gap-1 hover:underline">
                  View All Updates <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* 7. City Issue Statistics */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-blue-500"></div>
              <h3 className="text-xl font-bold text-[#003366] uppercase tracking-wide">City-wide Statistics</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Issues', value: '12,842', trend: '+5%', color: 'border-l-4 border-blue-500' },
                { label: 'Pending Issues', value: '1,248', trend: '-2%', color: 'border-l-4 border-orange-500' },
                { label: 'Resolved Issues', value: '11,594', trend: '+12%', color: 'border-l-4 border-green-500' },
                { label: 'High Priority', value: '142', trend: 'Critical', color: 'border-l-4 border-red-500' },
                { label: 'Avg Resolution', value: '3.4 Days', trend: '-10%', color: 'border-l-4 border-purple-500' },
                { label: 'Active Engineers', value: '248', trend: 'Online', color: 'border-l-4 border-teal-500' },
              ].map((stat, i) => (
                <div key={i} className={`bg-white p-5 border rounded-sm shadow-sm ${stat.color}`}>
                  <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">{stat.label}</p>
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-2xl font-black text-slate-800">{stat.value}</h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.trend.includes('+') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 8. Issue Categories Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-8 bg-[#003366]"></div>
            <h3 className="text-xl font-bold text-[#003366] uppercase tracking-wide">Key Civic Concerns</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ISSUE_CATEGORIES.map((cat, i) => (
              <div key={i} className="bg-white border p-6 rounded-sm text-center flex flex-col items-center gap-3 hover:border-blue-300 transition-all cursor-pointer shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 border border-slate-100">
                  {cat.icon}
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-800">{cat.title}</h5>
                  <p className="text-lg font-black text-blue-900">{cat.count}</p>
                </div>
                <div className={`text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-tighter ${getPriorityColor(cat.priority)}`}>
                  {cat.priority} PRIORITY
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9. Ward Coverage Section */}
        <section className="bg-[#003366] text-white p-8 md:p-12 rounded-sm shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ward-Wise Monitoring Coverage</h3>
              <p className="text-blue-100 text-sm max-w-md">Select an administrative ward to view its specific performance metrics and critical issue density.</p>
            </div>
            <div className="w-full md:w-64">
              <label className="block text-[10px] font-bold text-blue-200 uppercase mb-2">Select Administrative Ward</label>
              <select 
                className="w-full bg-blue-800 border-blue-700 text-white rounded p-3 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={selectedWard.id}
                onChange={handleWardChange}
              >
                {WARD_DATA.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 p-6 border border-white/10 rounded">
              <p className="text-blue-200 text-xs font-bold uppercase mb-2">Total Issues</p>
              <p className="text-4xl font-black">{selectedWard.totalIssues}</p>
            </div>
            <div className="bg-white/10 p-6 border border-white/10 rounded">
              <p className="text-blue-200 text-xs font-bold uppercase mb-2">Pending</p>
              <p className="text-4xl font-black text-orange-400">{selectedWard.pending}</p>
            </div>
            <div className="bg-white/10 p-6 border border-white/10 rounded">
              <p className="text-blue-200 text-xs font-bold uppercase mb-2">Resolution Rate</p>
              <p className="text-4xl font-black text-green-400">{selectedWard.resolvedPercentage}%</p>
            </div>
            <div className="bg-white/10 p-6 border border-white/10 rounded">
              <p className="text-blue-200 text-xs font-bold uppercase mb-2">Top Concern</p>
              <p className="text-2xl font-bold pt-1">{selectedWard.topIssueType}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button className="bg-white text-[#003366] px-6 py-2 font-bold text-sm rounded flex items-center gap-2 hover:bg-blue-50 transition-colors">
              Download Ward Report <ExternalLink size={14} />
            </button>
          </div>
        </section>

      </main>

      {/* 10. Footer */}
      <footer className="bg-[#1a1a1a] text-white pt-16 pb-8 px-4 md:px-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/10 pb-12 mb-8">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                <img src="https://picsum.photos/seed/footer-logo/60/60" alt="VMC" className="w-8 h-8 opacity-80" />
              </div>
              <h4 className="font-bold text-lg leading-tight">Vadodara Municipal Corporation</h4>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Khanderao Market Building, <br />
              Rajmahal Road, Vadodara - 390209,<br />
              Gujarat, India.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Phone size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Mail size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Globe size={14} />
              </a>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-sm uppercase tracking-widest border-l-4 border-blue-500 pl-3 mb-6">Quick Links</h5>
            <ul className="space-y-3 text-sm text-slate-400">
              {['VMC Official Website', 'Smart City Vadodara', 'Digital India', 'MyGov India', 'Gujarat State Portal', 'Sitemap'].map(item => (
                <li key={item} className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
                  <ChevronRight size={14} /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-sm uppercase tracking-widest border-l-4 border-blue-500 pl-3 mb-6">Contact Support</h5>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-blue-500 mt-1 shrink-0" />
                <div>
                  <p className="text-white font-bold">Helpline (24x7)</p>
                  <p>1800 233 0263</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-blue-500 mt-1 shrink-0" />
                <div>
                  <p className="text-white font-bold">Email Support</p>
                  <p>it-cell@vmc.gov.in</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-sm uppercase tracking-widest border-l-4 border-blue-500 pl-3 mb-6">Important Info</h5>
            <div className="bg-white/5 p-4 rounded text-xs text-slate-400 leading-relaxed">
              This portal is an AI-enhanced monitoring platform designed to support VMC's engineers in identifying civic distress automatically via geo-fenced imagery. 
              <br /><br />
              <span className="text-white font-bold">Disclaimer:</span> Real-time data processing may have a latency of up to 15 minutes.
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>© 2024 Vadodara Municipal Corporation. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
            <a href="#" className="hover:text-white">Accessibility Statement</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
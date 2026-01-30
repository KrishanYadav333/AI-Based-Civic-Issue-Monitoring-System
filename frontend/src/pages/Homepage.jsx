import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FileText, MapPin, BarChart3, ShieldAlert, Download, Brain, 
  Phone, Mail, CircleDot, Trash2, HardHat, Dog, CornerDownRight, 
  AlertCircle, TrendingUp, TrendingDown, Bell, ChevronRight 
} from 'lucide-react';
import TopUtilityBar from '../components/common/TopUtilityBar';
import VMCHeader from '../components/common/VMCHeader';
import VMCFooter from '../components/common/VMCFooter';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Homepage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedWard, setSelectedWard] = useState('all');
  const [wardData, setWardData] = useState([]);
  const [issueCategories, setIssueCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIssues: 0,
    pending: 0,
    resolved: 0,
    resolvedPercentage: 0
  });

  // Fetch LIVE data from backend
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        
        // Fetch all issues
        const issuesResponse = await axios.get(`${API_URL}/api/issues`);
        const issues = issuesResponse.data;

        // Calculate ward statistics
        const wardStats = {};
        issues.forEach(issue => {
          const wardId = issue.ward_id || issue.ward || 'unknown';
          if (!wardStats[wardId]) {
            wardStats[wardId] = {
              id: wardId,
              name: `Ward ${wardId}`,
              totalIssues: 0,
              pending: 0,
              resolved: 0,
              issues: []
            };
          }
          wardStats[wardId].totalIssues++;
          wardStats[wardId].issues.push(issue);
          
          const status = (issue.status || '').toLowerCase();
          if (status === 'resolved' || status === 'closed') {
            wardStats[wardId].resolved++;
          } else if (status === 'pending' || status === 'open') {
            wardStats[wardId].pending++;
          }
        });

        // Convert to array and calculate percentages
        const wardDataArray = Object.values(wardStats).map(ward => ({
          ...ward,
          resolvedPercentage: ward.totalIssues > 0 
            ? Math.round((ward.resolved / ward.totalIssues) * 100) 
            : 0,
          topIssueType: getTopIssueType(ward.issues)
        }));

        setWardData(wardDataArray);

        // Calculate issue categories
        const categoryCount = {};
        issues.forEach(issue => {
          const type = issue.issue_type || issue.type || 'Other';
          categoryCount[type] = (categoryCount[type] || 0) + 1;
        });

        const categoriesArray = Object.entries(categoryCount).map(([type, count]) => ({
          title: type,
          count: count,
          priority: count > 100 ? 'High' : count > 50 ? 'Medium' : 'Low',
          icon: getIconForType(type),
          color: getColorForType(type)
        }));

        setIssueCategories(categoriesArray);

        // Calculate overall stats
        const totalIssues = issues.length;
        const resolved = issues.filter(i => 
          (i.status || '').toLowerCase() === 'resolved' || 
          (i.status || '').toLowerCase() === 'closed'
        ).length;
        const pending = issues.filter(i => 
          (i.status || '').toLowerCase() === 'pending' || 
          (i.status || '').toLowerCase() === 'open'
        ).length;

        setStats({
          totalIssues,
          pending,
          resolved,
          resolvedPercentage: totalIssues > 0 ? Math.round((resolved / totalIssues) * 100) : 0
        });

      } catch (error) {
        console.error('Error fetching live data:', error);
        // Fallback to empty arrays on error
        setWardData([]);
        setIssueCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTopIssueType = (issues) => {
    if (!issues || issues.length === 0) return 'N/A';
    const typeCounts = {};
    issues.forEach(issue => {
      const type = issue.issue_type || issue.type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    return Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  };

  const getIconForType = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('pothole')) return CircleDot;
    if (lowerType.includes('garbage') || lowerType.includes('waste')) return Trash2;
    if (lowerType.includes('debris') || lowerType.includes('construction')) return HardHat;
    if (lowerType.includes('animal') || lowerType.includes('cattle') || lowerType.includes('dog')) return Dog;
    if (lowerType.includes('road') || lowerType.includes('broken')) return CornerDownRight;
    if (lowerType.includes('manhole')) return AlertCircle;
    return FileText;
  };

  const getColorForType = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('pothole') || lowerType.includes('manhole')) return 'red';
    if (lowerType.includes('garbage')) return 'orange';
    if (lowerType.includes('debris')) return 'green';
    if (lowerType.includes('animal')) return 'purple';
    if (lowerType.includes('road')) return 'blue';
    return 'gray';
  };

  const notices = [
    { id: 1, text: 'New waste segregation rules effective from next month', date: '2024-02-15', isNew: true },
    { id: 2, text: 'Ward 12 road repair work scheduled for March', date: '2024-02-14', isNew: true },
    { id: 3, text: 'Monthly civic issue resolution meeting on 20th Feb', date: '2024-02-13', isNew: false },
    { id: 4, text: 'AI system accuracy improved by 15% this quarter', date: '2024-02-10', isNew: false }
  ];

  const quickTiles = [
    { title: 'Report Issue', icon: FileText, color: 'red', path: '/submit-issue' },
    { title: 'Track Status', icon: MapPin, color: 'blue', path: '/login' },
    { title: 'Ward Heatmap', icon: MapPin, color: 'green', path: '/login' },
    { title: 'Analytics Dashboard', icon: BarChart3, color: 'yellow', path: '/login' },
    { title: 'Emergency Alerts', icon: ShieldAlert, color: 'red', path: '/login' },
    { title: 'Download Reports', icon: Download, color: 'blue', path: '/login' },
    { title: 'AI Insights', icon: Brain, color: 'purple', path: '/login' },
    { title: 'Contact Support', icon: Phone, color: 'green', path: '/login' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const selectedWardData = selectedWard === 'all' 
    ? stats
    : wardData.find(w => w.id === selectedWard) || stats;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <TopUtilityBar />
        <VMCHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0056b3] mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading live data...</p>
          </div>
        </div>
        <VMCFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopUtilityBar />
      <VMCHeader />
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#0056b3] text-white shadow-md">
        <div className="px-4 md:px-10 py-3 flex items-center justify-between">
          <ul className="hidden md:flex items-center gap-1 text-sm font-medium">
            <li className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/')}>Home</li>
            <li className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer border-l border-white/20" onClick={() => navigate('/login')}>About VMC System</li>
            <li className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer border-l border-white/20" onClick={() => navigate('/submit-issue')}>Citizen Services</li>
            <li className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer border-l border-white/20" onClick={() => navigate('/login')}>Ward Dashboard</li>
            <li className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer border-l border-white/20" onClick={() => navigate('/submit-issue')}>Issue Reporting</li>
            <li className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer border-l border-white/20" onClick={() => navigate('/login')}>Analytics</li>
            <li className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer border-l border-white/20" onClick={() => navigate('/login')}>Contact Us</li>
          </ul>
          <button 
            onClick={() => navigate('/login')}
            className="bg-white text-[#0056b3] px-6 py-2 rounded-sm font-bold text-sm hover:bg-slate-100 transition-colors"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="bg-slate-100 py-16 px-4 md:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#003366] mb-4 leading-tight">
              Building a Smarter, Cleaner Vadodara
            </h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              AI-powered civic issue monitoring system for real-time tracking, efficient resolution, 
              and transparent governance across all 19 wards of Vadodara.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/submit-issue')}
                className="bg-[#003366] text-white px-8 py-3 rounded-sm font-bold hover:bg-[#002244] transition-colors shadow-md"
              >
                Report an Issue
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="bg-white text-[#003366] border-2 border-[#003366] px-8 py-3 rounded-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Track Status
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="h-80 bg-gradient-to-br from-blue-600 to-blue-400 rounded-sm shadow-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800" 
                alt="Vadodara City" 
                className="w-full h-full object-cover opacity-60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Service Tiles */}
      <section className="py-12 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-[#003366] mb-6 uppercase tracking-wide">Quick Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <div 
                  key={tile.title}
                  onClick={() => navigate(tile.path)}
                  className={`bg-${tile.color}-50 border border-${tile.color}-200 p-6 rounded-sm hover:shadow-lg transition-all cursor-pointer group`}
                >
                  <Icon className={`w-10 h-10 text-${tile.color}-600 mb-3 group-hover:scale-110 transition-transform`} />
                  <h3 className="font-bold text-slate-800 text-sm">{tile.title}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Announcements & Statistics */}
      <section className="py-12 px-4 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Latest Announcements */}
          <div className="md:col-span-1">
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
              <div className="bg-[#003366] text-white p-4 flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                  <Bell size={16} />
                  Latest Announcements
                </h3>
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-sm font-bold">
                  Real-time
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notices.map((notice) => (
                  <div key={notice.id} className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm text-slate-800 font-medium">{notice.text}</p>
                      {notice.isNew && (
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-sm font-bold whitespace-nowrap">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{notice.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* City-wide Statistics */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-[#003366] mb-6 uppercase tracking-wide">City-wide Statistics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border-l-4 border-blue-500 p-5 rounded-sm shadow-sm">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total Issues</p>
                <p className="text-3xl font-black text-slate-800 mb-1">6,094</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600 font-bold">+12%</span>
                  <span className="text-slate-500">vs last month</span>
                </div>
              </div>
              
              <div className="bg-white border-l-4 border-orange-500 p-5 rounded-sm shadow-sm">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Pending</p>
                <p className="text-3xl font-black text-slate-800 mb-1">1,251</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingDown className="w-3 h-3 text-red-600" />
                  <span className="text-red-600 font-bold">-8%</span>
                  <span className="text-slate-500">vs last month</span>
                </div>
              </div>
              
              <div className="bg-white border-l-4 border-green-500 p-5 rounded-sm shadow-sm">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Resolved</p>
                <p className="text-3xl font-black text-slate-800 mb-1">4,843</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600 font-bold">+15%</span>
                  <span className="text-slate-500">vs last month</span>
                </div>
              </div>
              
              <div className="bg-white border-l-4 border-red-500 p-5 rounded-sm shadow-sm">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">High Priority</p>
                <p className="text-3xl font-black text-slate-800 mb-1">289</p>
                <div className="flex items-center gap-1 text-xs">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  <span className="text-red-600 font-bold">Urgent</span>
                </div>
              </div>
              
              <div className="bg-white border-l-4 border-purple-500 p-5 rounded-sm shadow-sm">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Avg Resolution</p>
                <p className="text-3xl font-black text-slate-800 mb-1">2.4</p>
                <p className="text-xs text-slate-500">days</p>
              </div>
              
              <div className="bg-white border-l-4 border-teal-500 p-5 rounded-sm shadow-sm">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">AI Accuracy</p>
                <p className="text-3xl font-black text-slate-800 mb-1">94.2%</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600 font-bold">+3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Issue Categories */}
      <section className="py-12 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-[#003366] mb-6 uppercase tracking-wide">Issue Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {issueCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.title} className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm text-center hover:shadow-lg transition-shadow">
                  <div className={`w-14 h-14 bg-${category.color}-100 rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-7 h-7 text-${category.color}-600`} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-2">{category.title}</h3>
                  <p className="text-2xl font-black text-slate-900 mb-2">{category.count}</p>
                  <span className={`inline-block text-[10px] px-2 py-1 rounded-sm border font-bold ${getPriorityColor(category.priority)}`}>
                    {category.priority}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ward-wise Monitoring */}
      <section className="py-16 px-4 md:px-10 bg-[#003366] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold uppercase tracking-wide">Ward-wise Monitoring</h2>
            <select 
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full md:w-64 bg-white/10 border border-white/20 px-4 py-2 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all">All Wards</option>
              {wardData.map(ward => (
                <option key={ward.id} value={ward.id}>{ward.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-sm">
              <p className="text-xs text-white/70 uppercase tracking-widest mb-2">Total Issues</p>
              <p className="text-3xl font-black text-white">{selectedWardData.totalIssues}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-sm">
              <p className="text-xs text-white/70 uppercase tracking-widest mb-2">Pending</p>
              <p className="text-3xl font-black text-orange-400">{selectedWardData.pending}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-sm">
              <p className="text-xs text-white/70 uppercase tracking-widest mb-2">Resolved</p>
              <p className="text-3xl font-black text-green-400">{selectedWardData.resolved}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-sm">
              <p className="text-xs text-white/70 uppercase tracking-widest mb-2">Resolution Rate</p>
              <p className="text-3xl font-black text-white">{selectedWardData.resolvedPercentage}%</p>
            </div>
          </div>
        </div>
      </section>

      <VMCFooter />
    </div>
  );
};

export default Homepage;

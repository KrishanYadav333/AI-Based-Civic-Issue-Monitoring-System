import React from 'react';
import { 
  AlertCircle, 
  Search, 
  MapPin, 
  Shield, 
  LayoutDashboard, 
  Bell, 
  BarChart3, 
  Phone,
  ArrowRight
} from 'lucide-react';
import TopHeader from '../components/common/TopHeader';
import MainHeader from '../components/common/MainHeader';
import PublicNavbar from '../components/common/PublicNavbar';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const navigate = useNavigate();

  const quickServices = [
    { 
      title: 'REPORT ISSUE', 
      icon: AlertCircle, 
      color: 'bg-red-50 border-red-200', 
      textColor: 'text-red-600',
      iconColor: 'text-red-500',
      link: '/issue-reporting'
    },
    { 
      title: 'TRACK STATUS', 
      icon: Search, 
      color: 'bg-blue-50 border-blue-200', 
      textColor: 'text-blue-600',
      iconColor: 'text-blue-500',
      link: '/track-status'
    },
    { 
      title: 'WARD HEATMAP', 
      icon: MapPin, 
      color: 'bg-green-50 border-green-200', 
      textColor: 'text-green-600',
      iconColor: 'text-green-500',
      link: '/ward-heatmap'
    },
    { 
      title: 'ENGINEER PORTAL', 
      icon: Shield, 
      color: 'bg-purple-50 border-purple-200', 
      textColor: 'text-purple-600',
      iconColor: 'text-purple-500',
      link: '/login?role=engineer'
    },
    { 
      title: 'ADMIN DASHBOARD', 
      icon: LayoutDashboard, 
      color: 'bg-orange-50 border-orange-200', 
      textColor: 'text-orange-600',
      iconColor: 'text-orange-500',
      link: '/login?role=admin'
    },
    { 
      title: 'NOTIFICATIONS', 
      icon: Bell, 
      color: 'bg-yellow-50 border-yellow-200', 
      textColor: 'text-yellow-600',
      iconColor: 'text-yellow-500',
      link: '/notifications'
    },
    { 
      title: 'ANALYTICS REPORTS', 
      icon: BarChart3, 
      color: 'bg-teal-50 border-teal-200', 
      textColor: 'text-teal-600',
      iconColor: 'text-teal-500',
      link: '/analytics'
    },
    { 
      title: 'EMERGENCY HELPLINE', 
      icon: Phone, 
      color: 'bg-indigo-50 border-indigo-200', 
      textColor: 'text-indigo-600',
      iconColor: 'text-indigo-500',
      link: '/emergency'
    },
  ];

  const announcements = [
    { date: '2024-10-20', title: 'Ward 3 road maintenance scheduled for 25th Oct', isNew: true },
    { date: '2024-10-19', title: 'Garbage pickup drive completed in Fatehgunj area', isNew: false },
    { date: '2024-10-18', title: 'New open manhole reported near Alkapuri - Team deployed', isNew: true },
  ];

  const statistics = [
    { 
      label: 'TOTAL ISSUES', 
      value: '12,842', 
      trend: '+5%', 
      trendPositive: true, 
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'PENDING ISSUES', 
      value: '1,248', 
      trend: '-2%', 
      trendPositive: false, 
      borderColor: 'border-orange-400',
      bgColor: 'bg-orange-50'
    },
    { 
      label: 'RESOLVED ISSUES', 
      value: '11,594', 
      trend: '+12%', 
      trendPositive: true, 
      borderColor: 'border-green-400',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'HIGH PRIORITY', 
      value: '142', 
      badge: 'Critical', 
      badgeColor: 'text-blue-600', 
      borderColor: 'border-red-400',
      bgColor: 'bg-red-50'
    },
    { 
      label: 'AVG RESOLUTION', 
      value: '3.4 Days', 
      trend: '-10%', 
      trendPositive: false, 
      borderColor: 'border-purple-400',
      bgColor: 'bg-purple-50'
    },
    { 
      label: 'ACTIVE ENGINEERS', 
      value: '248', 
      badge: 'Online', 
      badgeColor: 'text-blue-600', 
      borderColor: 'border-green-400',
      bgColor: 'bg-green-50'
    },
  ];

  return (
    <div id="main-content" className="min-h-screen bg-gray-50">
      <TopHeader />
      <MainHeader />
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#144272] to-[#0a2647] text-white py-16">
        <div className="container mx-auto px-5">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Empowering Citizens,<br />Transforming Urban Governance
            </h1>
            <p className="text-lg text-white/90 mb-6 leading-relaxed">
              An AI-powered platform for proactive civic issue monitoring and resolution across Vadodara city.
              Report, track, and resolve civic issues in real-time with our advanced geo-fencing technology.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/issue-reporting')} 
                className="bg-[#e67e22] hover:bg-[#d35400] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                Report an Issue <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/about')} 
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        {/* Quick Services Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
            QUICK SERVICES
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickServices.map((service, index) => (
              <button
                key={index}
                onClick={() => navigate(service.link)}
                className={`${service.color} border-2 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
              >
                <div className="flex flex-col items-center gap-3">
                  <service.icon className={`w-12 h-12 ${service.iconColor}`} />
                  <h3 className={`${service.textColor} font-bold text-sm text-center`}>
                    {service.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Announcements - Left Side */}
          <div className="lg:col-span-1">
            <div className="bg-blue-700 text-white rounded-t-lg px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-bold">Latest Announcements</h3>
              </div>
              <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                Real-time
              </span>
            </div>
            
            <div className="bg-white rounded-b-lg shadow-md">
              {announcements.map((announcement, index) => (
                <div 
                  key={index} 
                  className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">{announcement.date}</span>
                        {announcement.isNew && (
                          <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{announcement.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* City-Wide Statistics - Right Side */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
              CITY-WIDE STATISTICS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statistics.map((stat, index) => (
                <div 
                  key={index}
                  className={`${stat.bgColor} border-2 ${stat.borderColor} rounded-lg p-6 hover:shadow-md transition-shadow`}
                >
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-2">
                    {stat.label}
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    
                    {stat.trend && (
                      <span className={`text-sm font-bold ${
                        stat.trendPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.trend}
                      </span>
                    )}
                    
                    {stat.badge && (
                      <span className={`text-sm font-semibold ${stat.badgeColor}`}>
                        {stat.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;

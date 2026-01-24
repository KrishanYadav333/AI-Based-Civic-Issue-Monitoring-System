import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues } from '../../store/issueSlice';
import { Card } from '../common/FormElements';
import { LoadingSpinner } from '../common/Loaders';
import { MapPin, Filter, Search, AlertCircle, Clock, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = () => {
  const dispatch = useDispatch();
  const { issues, loading } = useSelector(state => state.issues);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch]);

  // Filter issues based on search and filters
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.ward.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPriority = priorityFilter === 'all' || issue.priority.toLowerCase() === priorityFilter.toLowerCase();
      const matchStatus = statusFilter === 'all' || issue.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchPriority && matchStatus;
    });
  }, [issues, searchTerm, priorityFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: filteredIssues.length,
    critical: filteredIssues.filter(i => i.priority.toLowerCase() === 'critical').length,
    inProgress: filteredIssues.filter(i => i.status.toLowerCase() === 'in progress').length,
    resolved: filteredIssues.filter(i => i.status.toLowerCase() === 'resolved').length,
  }), [filteredIssues]);

  useEffect(() => {
    // Initialize map only once when component mounts
    if (mapInstanceRef.current) return;
    if (!mapRef.current) {
      console.log('Map ref not available yet');
      return;
    }

    const initializeMap = () => {
      try {
        console.log('Attempting to initialize map with container:', mapRef.current);
        
        const mapContainer = mapRef.current;
        if (!mapContainer) {
          console.error('Map container is null');
          return;
        }

        // Create the map instance with Vadodara coordinates
        const mapInstance = L.map(mapContainer, {
          center: [22.3072, 73.1812], // Vadodara, Gujarat, India
          zoom: 13,
          zoomControl: true,
          attributionControl: true,
        });

        console.log('Map instance created:', mapInstance);

        // Add tile layer
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 2,
        }).addTo(mapInstance);

        console.log('Tile layer added');

        // Force map to recalculate size
        mapInstance.invalidateSize();
        console.log('Map size invalidated');
        
        mapInstanceRef.current = mapInstance;
        console.log('Map initialization complete');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const animationFrame = requestAnimationFrame(() => {
      setTimeout(initializeMap, 100);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Update markers when filtered issues change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for each filtered issue
    filteredIssues.forEach(issue => {
      const color = issue.priority === 'Critical' ? 'red' : 
                   issue.priority === 'High' ? 'orange' : 
                   issue.priority === 'Medium' ? 'yellow' : 'green';

      const icon = L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const marker = L.marker(
        [issue.location.lat, issue.location.lng],
        { icon }
      ).addTo(map);

      marker.bindPopup(`
        <div style="font-family: system-ui;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px; color: #000;">${issue.title}</h3>
          <p style="margin: 4px 0; font-size: 13px; color: #555;">${issue.description}</p>
          <div style="border-top: 1px solid #e5e7eb; margin: 8px 0; padding-top: 8px;">
            <p style="margin: 4px 0; font-size: 12px; color: #666;"><strong>Ward:</strong> ${issue.ward}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;"><strong>Status:</strong> <span style="padding: 2px 6px; border-radius: 4px; background: ${issue.status === 'Resolved' ? '#d1fae5' : issue.status === 'In Progress' ? '#dbeafe' : '#fef3c7'}; color: ${issue.status === 'Resolved' ? '#065f46' : issue.status === 'In Progress' ? '#0c4a6e' : '#92400e'}; font-size: 11px;">${issue.status}</span></p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;"><strong>Priority:</strong> <span style="padding: 2px 6px; border-radius: 4px; background: ${issue.priority === 'Critical' ? '#fee2e2' : '#f3e8ff'}; color: ${issue.priority === 'Critical' ? '#7f1d1d' : '#6b21a8'}; font-size: 11px;">${issue.priority}</span></p>
          </div>
        </div>
      `);
    });
  }, [filteredIssues]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color, borderColor }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer border-l-4"
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider transition-colors duration-300">{label}</p>
          <p className="text-4xl font-bold mt-2 transition-all duration-300" style={{ color: '#0a2647' }}>{value}</p>
        </div>
        <div className="p-3 rounded-xl transition-all duration-300 hover:scale-110" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6 transition-transform duration-300 hover:rotate-12" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-8">
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold metallic-text">Geospatial View</h1>
            <p className="text-white/80 text-sm mt-1 font-medium">Interactive map with real-time issue tracking</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid with VMC Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={MapPin} 
          label="Issues on Map" 
          value={stats.total}
          color="#144272"
          borderColor="#144272"
        />
        <StatCard 
          icon={AlertCircle} 
          label="Critical" 
          value={stats.critical}
          color="#e74c3c"
          borderColor="#e74c3c"
        />
        <StatCard 
          icon={Clock} 
          label="In Progress" 
          value={stats.inProgress}
          color="#e67e22"
          borderColor="#e67e22"
        />
        <StatCard 
          icon={CheckCircle} 
          label="Resolved" 
          value={stats.resolved}
          color="#27ae60"
          borderColor="#27ae60"
        />
      </div>

      {/* Search and Filters Section */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 p-6"
      >
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search by issue title or ward..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144272] border border-gray-200 transition-all duration-300"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
              showFilters 
                ? 'bg-[#144272] text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4 transition-transform duration-300" />
            Filters
          </motion.button>
        </div>

        {/* Expandable Filters with VMC styling */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-5 pt-5 border-t border-gray-200 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority Level</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144272] border border-gray-300 font-medium hover:bg-gray-100 transition-all duration-300"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144272] border border-gray-300 font-medium hover:bg-gray-100 transition-all duration-300"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Map with VMC styling */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        whileHover={{ scale: 1.005, transition: { duration: 0.3 } }}
        className="bg-white rounded-xl shadow-md overflow-hidden p-4"
        style={{ 
          width: '100%',
          height: '600px',
          position: 'relative'
        }}
      >
        <div 
          ref={mapRef} 
          id="map" 
          style={{ 
            width: '100%',
            height: '100%',
            borderRadius: '12px',
            position: 'relative',
            zIndex: 1
          }} 
        />
        {filteredIssues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute top-4 right-4 bg-white rounded-xl shadow-xl px-4 py-3 z-10 flex items-center gap-2 border border-gray-200"
          >
            <TrendingUp className="w-4 h-4 text-[#27ae60]" />
            <p className="text-sm font-semibold text-gray-900">
              {filteredIssues.length} Issues
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Map Legend with VMC styling */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.25 }}
        whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 p-6"
      >
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#0a2647' }}>
          <Zap className="w-6 h-6" style={{ color: '#144272' }} />
          Map Legend
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { color: '#e74c3c', name: 'Critical', desc: 'High priority issues' },
            { color: '#e67e22', name: 'High', desc: 'Important issues' },
            { color: '#f39c12', name: 'Medium', desc: 'Standard priority' },
            { color: '#27ae60', name: 'Low', desc: 'Minor issues' },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.05, duration: 0.4 }}
              whileHover={{ x: 8, scale: 1.05, transition: { duration: 0.2 } }}
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 cursor-pointer"
            >
              <div className=\"w-10 h-10 rounded-full shadow-lg transition-transform duration-300 hover:scale-110\" style={{ backgroundColor: item.color }} />
              <div>
                <p className="font-semibold text-gray-900 text-sm transition-colors duration-300">{item.name}</p>
                <p className="text-xs text-gray-600 transition-colors duration-300">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Empty State */}
      {filteredIssues.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl p-8 text-center shadow-md border border-gray-200"
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#144272' }} />
          <p className="text-lg font-semibold mb-2" style={{ color: '#0a2647' }}>No Issues Found</p>
          <p className="text-gray-600">Try adjusting your search criteria or filters to find issues on the map.</p>
        </motion.div>
      )}
    </div>
    </div>
  );
};

export default MapView;

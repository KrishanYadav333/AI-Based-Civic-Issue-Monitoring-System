import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues } from '../../store/issueSlice';
import { Card } from '../common/FormElements';
import { LoadingSpinner } from '../common/Loaders';
import { MapPin, Filter, Search, AlertCircle, Clock, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import 'leaflet.heat';

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
  const [showHeatmap, setShowHeatmap] = useState(false);

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

        // Create the map instance
        const mapInstance = L.map(mapContainer, {
          center: [40.7128, -74.0060],
          zoom: 12,
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

  // Update markers and heatmap
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer._heat) {
        map.removeLayer(layer);
      }
    });

    if (showHeatmap) {
      if (!L.heatLayer) {
        console.warn('Leaflet.heat not loaded');
        return;
      }

      const points = filteredIssues.map(i => [
        i.location.lat,
        i.location.lng,
        i.priority === 'Critical' ? 1.0 : i.priority === 'High' ? 0.7 : 0.4
      ]);

      L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
      }).addTo(map);

    } else {
      // Add markers for each filtered issue
      filteredIssues.forEach(issue => {
        let icon;

        if (issue.priority === 'Critical') {
          icon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:#ef4444;' class='request-loader'></div>",
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
        } else if (issue.priority === 'High') {
          icon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:#f59e0b;' class='request-loader warning'></div>",
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
        } else {
          const color = issue.priority === 'Medium' ? 'yellow' : 'green';
          icon = L.icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-${color}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });
        }

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
    }
  }, [filteredIssues, showHeatmap]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color, bgGradient }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bgGradient} rounded-lg border border-opacity-20 border-white p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-100 text-xs font-medium uppercase tracking-wider opacity-90">{label}</p>
          <p className="text-4xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Geospatial View</h1>
            <p className="text-gray-600 text-sm mt-1">Interactive map with real-time issue tracking</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid with Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={MapPin}
          label="Issues on Map"
          value={stats.total}
          color="bg-blue-500"
          bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={AlertCircle}
          label="Critical"
          value={stats.critical}
          color="bg-red-500"
          bgGradient="bg-gradient-to-br from-red-500 to-red-600"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={stats.inProgress}
          color="bg-yellow-500"
          bgGradient="bg-gradient-to-br from-yellow-500 to-orange-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Resolved"
          value={stats.resolved}
          color="bg-green-500"
          bgGradient="bg-gradient-to-br from-green-500 to-emerald-600"
        />
      </div>

      {/* Search and Filters Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5"
      >
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by issue title or ward..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${showHeatmap
              ? 'bg-red-50 text-red-700 border-2 border-red-300'
              : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
          >
            <Zap className={`w-4 h-4 ${showHeatmap ? 'text-red-500 fill-current' : ''}`} />
            {showHeatmap ? 'Heatmap On' : 'Heatmap'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${showHeatmap
                ? 'bg-red-50 text-red-700 border-2 border-red-300'
                : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
          >
            <Zap className={`w-4 h-4 ${showHeatmap ? 'text-red-500 fill-current' : ''}`} />
            {showHeatmap ? 'Heatmap On' : 'Heatmap'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${showFilters
              ? 'bg-blue-50 text-blue-700 border-2 border-blue-300'
              : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </motion.button>
        </div>

        {/* Expandable Filters with better styling */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 pt-5 border-t border-gray-200 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority Level</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white hover:border-gray-400 transition-colors"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white hover:border-gray-400 transition-colors"
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

      {/* Map with enhanced styling */}
      <div
        style={{
          width: '100%',
          height: '550px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          marginBottom: '24px'
        }}
      >
        <div
          ref={mapRef}
          id="map"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: '12px'
          }}
        />
        {filteredIssues.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              padding: '12px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              {filteredIssues.length} Issues
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 shadow-md p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-600" />
          Map Legend
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { color: 'bg-red-500', name: 'Critical', desc: 'High priority issues', shadow: 'shadow-red-200' },
            { color: 'bg-orange-500', name: 'High', desc: 'Important issues', shadow: 'shadow-orange-200' },
            { color: 'bg-yellow-500', name: 'Medium', desc: 'Standard priority', shadow: 'shadow-yellow-200' },
            { color: 'bg-green-500', name: 'Low', desc: 'Minor issues', shadow: 'shadow-green-200' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + idx * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full ${item.color} shadow-lg ${item.shadow}`} />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                <p className="text-xs text-gray-600">{item.desc}</p>
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
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 text-center shadow-sm"
        >
          <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <p className="text-lg font-semibold text-gray-900 mb-2">No Issues Found</p>
          <p className="text-gray-600">Try adjusting your search criteria or filters to find issues on the map.</p>
        </motion.div>
      )}
    </div>
  );
};

export default MapView;

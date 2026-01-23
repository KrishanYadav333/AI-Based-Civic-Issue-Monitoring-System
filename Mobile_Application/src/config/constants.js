// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  AI_SERVICE_URL: 'http://localhost:8000',
  TIMEOUT: 30000,
};

// App Configuration
export const APP_CONFIG = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_QUALITY: 0.8,
  OFFLINE_QUEUE_LIMIT: 50,
  AUTO_SYNC_INTERVAL: 60000, // 1 minute
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_LOCATION: {
    latitude: 22.3072,
    longitude: 73.1812,
  },
  DEFAULT_ZOOM: 13,
};

// Issue Types
export const ISSUE_TYPES = [
  { id: 'pothole', label: 'Pothole', icon: 'road-variant' },
  { id: 'garbage', label: 'Garbage', icon: 'delete' },
  { id: 'debris', label: 'Debris', icon: 'dump-truck' },
  { id: 'stray_cattle', label: 'Stray Cattle', icon: 'cow' },
  { id: 'broken_road', label: 'Broken Road', icon: 'road' },
  { id: 'open_manhole', label: 'Open Manhole', icon: 'alert-circle' },
  { id: 'street_light', label: 'Street Light', icon: 'lightbulb' },
  { id: 'water_leakage', label: 'Water Leakage', icon: 'water' },
  { id: 'tree_fall', label: 'Tree Fall', icon: 'tree' },
  { id: 'illegal_construction', label: 'Illegal Construction', icon: 'home-alert' },
];

// Issue Statuses
export const ISSUE_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REJECTED: 'rejected',
};

export const STATUS_COLORS = {
  pending: '#FFA726',
  assigned: '#42A5F5',
  in_progress: '#66BB6A',
  resolved: '#26A69A',
  closed: '#78909C',
  rejected: '#EF5350',
};

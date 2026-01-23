export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  AI_SERVICE_URL: 'http://localhost:8000',
  TIMEOUT: 10000,
};

export const ISSUE_TYPES = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'streetlight', label: 'Street Light', icon: '💡' },
  { value: 'garbage', label: 'Garbage', icon: '🗑️' },
  { value: 'drainage', label: 'Drainage', icon: '🚰' },
  { value: 'road_damage', label: 'Road Damage', icon: '🛣️' },
  { value: 'water_leak', label: 'Water Leak', icon: '💧' },
  { value: 'tree_fall', label: 'Fallen Tree', icon: '🌳' },
  { value: 'traffic_signal', label: 'Traffic Signal', icon: '🚦' },
  { value: 'footpath', label: 'Footpath Damage', icon: '🚶' },
  { value: 'other', label: 'Other', icon: '📝' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

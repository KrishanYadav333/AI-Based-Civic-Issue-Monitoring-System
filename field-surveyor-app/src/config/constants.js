export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  AI_SERVICE_URL: 'http://localhost:8000',
  TIMEOUT: 10000,
};

export const ISSUE_TYPES = [
  { value: 'potholes', label: 'Potholes', icon: '🕳️' },
  { value: 'garbage', label: 'Garbage', icon: '🗑️' },
  { value: 'manhole', label: 'Manhole', icon: '⚠️' },
  { value: 'damaged_roads', label: 'Damaged Roads', icon: '🛣️' },
  { value: 'construction_debris', label: 'Construction Debris', icon: '🏗️' },
  { value: 'stray_animals', label: 'Stray Animals', icon: '🐕' },
  { value: 'water_leakage', label: 'Water Leakage', icon: '💧' },
  { value: 'visual_pollution', label: 'Visual Pollution', icon: '🚯' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

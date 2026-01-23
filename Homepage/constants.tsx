
import React from 'react';
import { 
  AlertCircle, 
  Trash2, 
  CornerDownRight, 
  Dog, 
  HardHat, 
  CircleDot, 
  FileText, 
  MapPin, 
  BarChart3, 
  ShieldAlert, 
  LayoutDashboard, 
  Bell, 
  FileSearch, 
  PhoneCall 
} from 'lucide-react';
import { WardStats, IssueCategory, Notice } from './types';

export const WARD_DATA: WardStats[] = Array.from({ length: 19 }, (_, i) => ({
  id: `ward-${i + 1}`,
  name: `Ward ${i + 1}`,
  totalIssues: Math.floor(Math.random() * 500) + 100,
  pending: Math.floor(Math.random() * 100) + 20,
  resolved: Math.floor(Math.random() * 400) + 80,
  resolvedPercentage: Math.floor(Math.random() * 20) + 75,
  topIssueType: ['Potholes', 'Garbage', 'Debris', 'Stray Cattle'][Math.floor(Math.random() * 4)]
}));

export const ISSUE_CATEGORIES: IssueCategory[] = [
  { title: 'Potholes', count: 421, priority: 'High', icon: <CircleDot size={20} /> },
  { title: 'Garbage', count: 1102, priority: 'Medium', icon: <Trash2 size={20} /> },
  { title: 'Debris', count: 189, priority: 'Medium', icon: <HardHat size={20} /> },
  { title: 'Stray Cattle', count: 56, priority: 'High', icon: <Dog size={20} /> },
  { title: 'Broken Roads', count: 324, priority: 'High', icon: <CornerDownRight size={20} /> },
  { title: 'Open Manholes', count: 12, priority: 'High', icon: <AlertCircle size={20} /> },
];

export const NOTICES: Notice[] = [
  { id: 1, text: "Ward 3 road maintenance scheduled for 25th Oct", date: "2024-10-20", isNew: true },
  { id: 2, text: "Garbage pickup drive completed in Fatehgunj area", date: "2024-10-19", isNew: false },
  { id: 3, text: "New open manhole reported near Alkapuri - Team deployed", date: "2024-10-18", isNew: true },
  { id: 4, text: "Quarterly civic issue report released for Q3", date: "2024-10-15", isNew: false },
];

export const QUICK_TILES = [
  { title: 'Report Issue', icon: <AlertCircle />, color: 'bg-red-50 text-red-700 border-red-200' },
  { title: 'Track Status', icon: <FileSearch />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { title: 'Ward Heatmap', icon: <MapPin />, color: 'bg-green-50 text-green-700 border-green-200' },
  { title: 'Engineer Portal', icon: <ShieldAlert />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { title: 'Admin Dashboard', icon: <LayoutDashboard />, color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { title: 'Notifications', icon: <Bell />, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { title: 'Analytics Reports', icon: <BarChart3 />, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { title: 'Emergency Helpline', icon: <PhoneCall />, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
];

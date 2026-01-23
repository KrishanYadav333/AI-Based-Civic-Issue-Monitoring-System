
import React from 'react';

export interface WardStats {
  id: string;
  name: string;
  totalIssues: number;
  pending: number;
  resolved: number;
  resolvedPercentage: number;
  topIssueType: string;
}

export interface IssueCategory {
  title: string;
  count: number;
  priority: 'High' | 'Medium' | 'Low';
  icon: React.ReactNode;
}

export interface Notice {
  id: number;
  text: string;
  date: string;
  isNew: boolean;
}

export interface Issue {
  id: string;
  type: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  wardId: string;
  status: 'pending' | 'assigned' | 'resolved';
  priority: 'High' | 'Medium' | 'Low';
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  images: string[];
}
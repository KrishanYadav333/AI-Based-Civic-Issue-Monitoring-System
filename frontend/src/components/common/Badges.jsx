import React from 'react';
import { getPriorityClass } from '../../utils/helpers';

export const PriorityBadge = ({ priority, size = 'md' }) => {
  const sizes = {
    sm: 'px-2 py-1 text-xs font-medium rounded-full',
    md: 'px-3 py-1.5 text-sm font-medium rounded-lg',
    lg: 'px-4 py-2 text-base font-medium rounded-lg',
  };

  return (
    <span className={`${sizes[size]} ${getPriorityClass(priority)}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

export const StatusBadge = ({ status, size = 'md' }) => {
  const statusColors = {
    pending: 'bg-blue-100 text-blue-800',
    assigned: 'bg-purple-100 text-purple-800',
    'in-progress': 'bg-indigo-100 text-indigo-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs font-medium rounded-full',
    md: 'px-3 py-1.5 text-sm font-medium rounded-lg',
    lg: 'px-4 py-2 text-base font-medium rounded-lg',
  };

  const statusLabel = {
    pending: 'Pending',
    assigned: 'Assigned',
    'in-progress': 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
  };

  return (
    <span className={`${sizes[size]} ${statusColors[status]}`}>
      {statusLabel[status] || status}
    </span>
  );
};

// Format date to readable format
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get priority color
export const getPriorityColor = (priority) => {
  const colors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#10b981',
  };
  return colors[priority] || '#6b7280';
};

// Get priority badge class
export const getPriorityClass = (priority) => {
  const classes = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };
  return classes[priority] || 'bg-gray-100 text-gray-800';
};

// Get status badge class
export const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'in-progress': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

// Get status label
export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    assigned: 'Assigned',
    'in-progress': 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
  };
  return labels[status] || status;
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Calculate days since date
export const daysSince = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffTime = Math.abs(now - then);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Export CSV data
export const exportToCSV = (data, filename) => {
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row =>
      Object.values(row)
        .map(val => {
          if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Filter issues based on criteria
export const filterIssues = (issues, filters) => {
  let filtered = [...issues];

  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(issue => filters.status.includes(issue.status));
  }

  if (filters.priority && filters.priority.length > 0) {
    filtered = filtered.filter(issue => filters.priority.includes(issue.priority));
  }

  if (filters.type && filters.type.length > 0) {
    filtered = filtered.filter(issue => filters.type.includes(issue.type));
  }

  if (filters.ward && filters.ward.length > 0) {
    filtered = filtered.filter(issue => filters.ward.includes(issue.ward));
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      issue =>
        issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query) ||
        issue.id.toLowerCase().includes(query)
    );
  }

  return filtered;
};

// Sort issues based on criteria
export const sortIssues = (issues, sortBy) => {
  const sorted = [...issues];
  const collator = new Intl.Collator('en', { numeric: true });

  switch (sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    case 'priority':
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    case 'title':
      return sorted.sort((a, b) => collator.compare(a.title, b.title));
    default:
      return sorted;
  }
};

// Paginate array
export const paginate = (array, pageNumber, pageSize) => {
  const startIndex = (pageNumber - 1) * pageSize;
  return array.slice(startIndex, startIndex + pageSize);
};

// Get pagination metadata
export const getPaginationMeta = (totalItems, pageNumber, pageSize) => {
  return {
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    currentPage: pageNumber,
    pageSize,
    hasNextPage: pageNumber < Math.ceil(totalItems / pageSize),
    hasPreviousPage: pageNumber > 1,
  };
};

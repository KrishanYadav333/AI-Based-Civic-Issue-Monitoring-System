import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin`} />
  );
};

export const LoadingSkeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded animate-pulse ${className}`}
        />
      ))}
    </>
  );
};

export const PageLoader = () => (
  <motion.div
    className="flex items-center justify-center min-h-screen"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </motion.div>
);

export const CardSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="p-4 border border-gray-200 rounded-lg animate-pulse"
      >
        <LoadingSkeleton count={3} className="mb-2 last:mb-0" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <table className="w-full">
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-200">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="p-4">
              <LoadingSkeleton />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

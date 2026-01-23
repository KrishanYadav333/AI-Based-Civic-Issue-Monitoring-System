import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose }) => {
  const styles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };

  const icons = {
    info: <Info className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
  };

  return (
    <div className={`flex items-start gap-3 p-4 border rounded-lg ${styles[type]}`}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-lg font-bold opacity-75 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
};

export const ErrorBoundary = ({ children, error, reset }) => {
  if (error) {
    return (
      <div className="p-4 border-l-4 border-red-400 bg-red-50">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-red-800">
              Something went wrong
            </p>
            <p className="text-xs text-red-700 mt-1">{error.message}</p>
            {reset && (
              <button
                onClick={reset}
                className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
};

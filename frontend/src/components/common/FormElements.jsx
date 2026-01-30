import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white border border-gray-200 rounded-lg p-6 shadow-soft ${
      hover ? 'hover:shadow-md transition-shadow' : ''
    } ${className}`}
  >
    {children}
  </motion.div>
);

const MetricCard = ({ label, value, subtext, trend, icon: Icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    danger: 'from-red-500 to-red-600',
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span
                className={`text-xs font-semibold ${
                  trend > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-lg text-white`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        variants[variant]
      } ${sizes[size]}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </motion.svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

const Input = ({ label, error, ...props }) => {
  const [isFocused, setIsFocused] = React.useState(false);
  
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
      {label && (
        <motion.label animate={{ opacity: isFocused ? 1 : 0.7 }} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </motion.label>
      )}
      <motion.div whileFocus={{ scale: 1.01 }} className="">
        <motion.input
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 transition ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
          {...props}
        />
      </motion.div>
      {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-500">{error}</motion.p>}
    </motion.div>
  );
};

const Select = ({ label, error, options, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
    )}
    <select
      className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 transition ${
        error
          ? 'border-red-500 focus:border-red-500'
          : 'border-gray-300 focus:border-primary-500'
      }`}
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && <div className="p-6 border-t border-gray-200">{footer}</div>}
      </motion.div>
    </motion.div>
  );
};

export { Card, MetricCard, Button, Input, Select, Modal };

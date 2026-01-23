import React, { useState, useMemo, memo } from 'react';
import { useSelector } from 'react-redux';
import { 
  Download, FileText, Calendar, Filter, BarChart3, 
  TrendingUp, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const ReportGenerator = () => {
  const { issues } = useSelector(state => state.issues);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('month');
  const [selectedWards, setSelectedWards] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

  // Extract unique values
  const wards = useMemo(() => [...new Set(issues.map(i => i.ward))].filter(Boolean), [issues]);
  const priorities = useMemo(() => [...new Set(issues.map(i => i.priority))].filter(Boolean), [issues]);

  // Filter data based on selection
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const wardMatch = selectedWards.length === 0 || selectedWards.includes(issue.ward);
      const priorityMatch = selectedPriorities.length === 0 || selectedPriorities.includes(issue.priority);
      return wardMatch && priorityMatch;
    });
  }, [issues, selectedWards, selectedPriorities]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredIssues.length;
    const resolved = filteredIssues.filter(i => i.status === 'Resolved').length;
    const pending = filteredIssues.filter(i => i.status === 'Pending').length;
    const inProgress = filteredIssues.filter(i => i.status === 'In Progress').length;
    const avgResolutionTime = 3.5; // days

    return {
      total,
      resolved,
      pending,
      inProgress,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      avgResolutionTime,
      efficiency: total > 0 ? Math.round(((resolved + inProgress) / total) * 100) : 0
    };
  }, [filteredIssues]);

  // Ward-wise breakdown
  const wardBreakdown = useMemo(() => {
    return wards.map(ward => {
      const wardIssues = filteredIssues.filter(i => i.ward === ward);
      return {
        ward,
        total: wardIssues.length,
        resolved: wardIssues.filter(i => i.status === 'Resolved').length,
        pending: wardIssues.filter(i => i.status === 'Pending').length,
        inProgress: wardIssues.filter(i => i.status === 'In Progress').length
      };
    });
  }, [filteredIssues, wards]);

  // Time series data
  const timeSeriesData = useMemo(() => {
    const days = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return days.map((day, idx) => ({
      period: day,
      reported: Math.floor(Math.random() * 15) + 5,
      resolved: Math.floor(Math.random() * 12) + 3
    }));
  }, []);

  // Priority distribution
  const priorityDistribution = useMemo(() => {
    return priorities.map(priority => ({
      name: priority,
      value: filteredIssues.filter(i => i.priority === priority).length,
      color: priority === 'Critical' ? '#ef4444' : 
             priority === 'High' ? '#f97316' : 
             priority === 'Medium' ? '#eab308' : '#22c55e'
    }));
  }, [filteredIssues, priorities]);

  const exportPDF = () => {
    const reportHTML = `
      <html>
        <head>
          <title>Civic Issue Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { color: #1f2937; border-bottom: 3px solid #10b981; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; border-left: 4px solid #3b82f6; padding-left: 10px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
            .stat-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
            .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; }
            td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>Civic Issue Monitoring Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          
          <h2>Summary Statistics</h2>
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${stats.total}</div>
              <div class="stat-label">Total Issues</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.resolved}</div>
              <div class="stat-label">Resolved</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.resolutionRate}%</div>
              <div class="stat-label">Resolution Rate</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.efficiency}%</div>
              <div class="stat-label">Efficiency</div>
            </div>
          </div>

          <h2>Ward-wise Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Ward</th>
                <th>Total Issues</th>
                <th>Resolved</th>
                <th>In Progress</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              ${wardBreakdown.map(ward => `
                <tr>
                  <td>${ward.ward}</td>
                  <td>${ward.total}</td>
                  <td>${ward.resolved}</td>
                  <td>${ward.inProgress}</td>
                  <td>${ward.pending}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>This report contains data from the Civic Issue Monitoring System</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const exportCSV = () => {
    let csvContent = 'Ward,Total Issues,Resolved,In Progress,Pending\n';
    wardBreakdown.forEach(ward => {
      csvContent += `${ward.ward},${ward.total},${ward.resolved},${ward.inProgress},${ward.pending}\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `civic-issues-report-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-gray-900">Report Generator</h1>
        <p className="text-gray-500 mt-1">Generate and export comprehensive reports on civic issues</p>
      </motion.div>

      {/* Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Type */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Report Type
          </h3>
          <div className="space-y-2">
            {[
              { value: 'summary', label: 'Summary Report' },
              { value: 'detailed', label: 'Detailed Analysis' },
              { value: 'ward', label: 'Ward-wise Breakdown' },
              { value: 'timeline', label: 'Timeline Report' }
            ].map(option => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input
                  type="radio"
                  name="reportType"
                  value={option.value}
                  checked={reportType === option.value}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Date Range */}
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Date Range
          </h3>
          <div className="space-y-2">
            {[
              { value: 'week', label: 'Last Week' },
              { value: 'month', label: 'Last Month' },
              { value: 'quarter', label: 'Last Quarter' },
              { value: 'year', label: 'This Year' }
            ].map(option => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input
                  type="radio"
                  name="dateRange"
                  value={option.value}
                  checked={dateRange === option.value}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-gray-700 font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-600" />
            Filters
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wards</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {wards.map(ward => (
                  <label key={ward} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedWards.includes(ward)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedWards([...selectedWards, ward]);
                        } else {
                          setSelectedWards(selectedWards.filter(w => w !== ward));
                        }
                      }}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-700">{ward}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: AlertCircle, label: 'Total Issues', value: stats.total, color: 'blue' },
          { icon: CheckCircle, label: 'Resolved', value: stats.resolved, color: 'green' },
          { icon: Clock, label: 'In Progress', value: stats.inProgress, color: 'amber' },
          { icon: TrendingUp, label: 'Efficiency', value: `${stats.efficiency}%`, color: 'purple' }
        ].map((metric, idx) => {
          const Icon = metric.icon;
          const bgColor = metric.color === 'blue' ? 'from-blue-50 to-cyan-50' :
                         metric.color === 'green' ? 'from-emerald-50 to-teal-50' :
                         metric.color === 'amber' ? 'from-amber-50 to-orange-50' :
                         'from-purple-50 to-pink-50';
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${bgColor} rounded-2xl border border-gray-200 shadow-sm p-6`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{metric.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <Icon className="w-8 h-8 text-gray-400 opacity-50" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ward Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wardBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="ward" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" />
              <Bar dataKey="resolved" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Time Series */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="period" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="reported" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Export Buttons */}
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportPDF}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
        >
          <Download className="w-5 h-5" />
          Export as PDF
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportCSV}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
        >
          <Download className="w-5 h-5" />
          Export as CSV
        </motion.button>
      </div>
    </div>
  );
};

export default memo(ReportGenerator);

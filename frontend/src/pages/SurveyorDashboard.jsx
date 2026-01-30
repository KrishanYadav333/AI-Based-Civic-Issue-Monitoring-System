import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchIssues } from '../store/issueSlice';
import { motion } from 'framer-motion';
import { Camera, MapPin, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// VMC Government Colors
const VMC_COLORS = {
  primary: '#003366',
  primaryBlue: '#0056b3',
  green: '#27ae60',
  red: '#e74c3c',
  yellow: '#f39c12',
};

const SurveyorDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { issues, loading } = useSelector(state => state.issues);
  const user = useSelector(state => state.auth.user);
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    resolved: 0
  });

  useEffect(() => {
    dispatch(fetchIssues());
  }, [dispatch]);

  useEffect(() => {
    // Calculate stats for surveyor's issues
    const surveyorIssues = issues.filter(issue => 
      issue.submitted_by === user?.id || issue.surveyor_id === user?.id
    );
    
    setStats({
      total: surveyorIssues.length,
      pending: surveyorIssues.filter(i => i.status === 'Pending' || i.status === 'pending').length,
      assigned: surveyorIssues.filter(i => i.status === 'Assigned' || i.status === 'assigned').length,
      resolved: surveyorIssues.filter(i => i.status === 'Resolved' || i.status === 'resolved').length,
    });
  }, [issues, user]);

  const myIssues = issues.filter(issue => 
    issue.submitted_by === user?.id || issue.surveyor_id === user?.id
  ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'resolved') return 'bg-green-100 text-green-800 border-green-300';
    if (statusLower === 'assigned' || statusLower === 'in progress') return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`${bgColor} rounded-xl p-6 shadow-lg border-l-4 ${color} cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600 uppercase">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('text-', 'bg-')}/20`}>
          <Icon className="w-8 h-8 text-gray-700" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-[#0a2647]">{t('surveyorDash.title')}</h1>
          <p className="text-gray-600 mt-1 font-medium">{t('surveyorDash.welcome')}{user?.username || 'Surveyor'}{t('surveyorDash.welcomeDesc')}</p>
        </motion.div>

        {/* Quick Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/surveyor/report-issue')}
          className="w-full bg-gradient-to-r from-[#0056b3] to-[#003366] text-white py-6 rounded-xl font-bold text-lg hover:from-[#004494] hover:to-[#002244] transition-all shadow-xl flex items-center justify-center gap-3"
        >
          <Camera className="w-6 h-6" />
          Report New Issue
        </motion.button>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label={t('surveyorDash.totalIssues')}
            value={stats.total}
            color="border-[#0056b3]"
            bgColor="bg-white"
          />
          <StatCard
            icon={Clock}
            label={t('surveyorDash.pending')}
            value={stats.pending}
            color="border-yellow-500"
            bgColor="bg-white"
          />
          <StatCard
            icon={AlertCircle}
            label={t('surveyorDash.assigned')}
            value={stats.assigned}
            color="border-blue-500"
            bgColor="bg-white"
          />
          <StatCard
            icon={CheckCircle}
            label={t('surveyorDash.resolved')}
            value={stats.resolved}
            color="border-green-500"
            bgColor="bg-white"
          />
        </div>

        {/* Recent Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-[#0a2647] mb-4">My Reported Issues</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0056b3] border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading issues...</p>
            </div>
          ) : myIssues.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No issues reported yet</p>
              <button
                onClick={() => navigate('/surveyor/report-issue')}
                className="mt-4 px-6 py-2 bg-[#0056b3] text-white rounded-lg hover:bg-[#004494] transition-colors"
              >
                Report Your First Issue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myIssues.map((issue) => (
                <motion.div
                  key={issue._id || issue.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => navigate(`/surveyor/issue/${issue._id || issue.id}`)}
                >
                  {issue.image_url && (
                    <img
                      src={issue.image_url}
                      alt="Issue"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-gray-900 capitalize">
                        {issue.issue_type || issue.issueType || 'Other'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {issue.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{issue.address || 'Location captured'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                      <span className="capitalize">Priority: {issue.priority}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default SurveyorDashboard;

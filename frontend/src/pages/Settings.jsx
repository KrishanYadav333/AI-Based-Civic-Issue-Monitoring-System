import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, Lock, Bell, Eye, EyeOff, Check, Moon, Sun, Download, Trash2, Shield } from 'lucide-react';
import { logout } from '../store/authSlice';
import backgroundImage from '../assets/images/Background_image.jpg';

export default function Settings() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'engineer1@example.com',
    ward: user?.ward || 'Ward 1',
    phone: user?.phone || '+91-9876543210',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    issueAssigned: true,
    issueResolved: true,
    dailySummary: true,
    weeklyReport: false,
    email: true,
    inApp: true,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    shareData: true,
    marketingEmails: false,
    showActivity: true,
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadData = () => {
    const userData = {
      profile: formData,
      role: user?.role,
      issuesResolved: Math.floor(Math.random() * 45) + 5,
      averageResolutionTime: Math.floor(Math.random() * 48) + 2,
      downloadDate: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-data-${Date.now()}.json`;
    link.click();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion request submitted. Our team will contact you within 24 hours.');
    }
  };

  const handleSaveProfile = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setSaveSuccess(true);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
  ];

  return (
    <div 
      className="min-h-screen py-8 px-4 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Navy blue gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-blue-800/30 to-blue-600/35 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-white drop-shadow-lg" />
            <h1 className="text-4xl font-bold text-white drop-shadow-lg bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent" style={{textShadow: '0 2px 10px rgba(0,0,0,0.3), 0 0 30px rgba(255,255,255,0.3), 0 0 40px rgba(59,130,246,0.5)'}}>Settings</h1>
          </div>
          <p className="text-white font-semibold drop-shadow-lg">Manage your account preferences and settings</p>
        </motion.div>

        {saveSuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 glass-card border border-green-400/30 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-green-300" />
            <span className="text-white font-semibold drop-shadow-lg">Settings saved successfully!</span>
          </motion.div>
        )}

        <div className="flex gap-2 mb-6 glass-card-strong rounded-t-lg p-4 overflow-x-auto">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all duration-300 whitespace-nowrap drop-shadow-md ${
                  activeTab === tab.id ? 'text-white border-b-2 border-blue-400' : 'text-white/70 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-b-lg shadow-2xl p-6">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.05, delayChildren: 0.1 }} className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div whileHover={{ y: -2 }} className="">
                  <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">Full Name</label>
                  <motion.input whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)' }} type="text" name="name" value={formData.name} onChange={handleProfileChange} className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-white/60 font-medium" />
                </motion.div>
                <motion.div whileHover={{ y: -2 }} className="">
                  <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">Email Address</label>
                  <motion.input whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)' }} type="email" name="email" value={formData.email} onChange={handleProfileChange} className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-white/60 font-medium" />
                </motion.div>
                <motion.div whileHover={{ y: -2 }} className="">
                  <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">Ward / Zone</label>
                  <motion.input whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)' }} type="text" name="ward" value={formData.ward} onChange={handleProfileChange} className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-white/60 font-medium" />
                </motion.div>
                <motion.div whileHover={{ y: -2 }} className="">
                  <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">Phone Number</label>
                  <motion.input whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)' }} type="tel" name="phone" value={formData.phone} onChange={handleProfileChange} className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-white placeholder-white/60 font-medium" />
                </motion.div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-light border border-blue-400/30 rounded-lg p-4">
                <p className="text-sm text-white font-semibold drop-shadow-lg"><span className="font-bold">Current Role:</span> {user?.role || 'Engineer'}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-3">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveProfile} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <Save className="w-5 h-5" />
                  Save Changes
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.05, delayChildren: 0.1 }} className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="">
                <h3 className="text-lg font-bold text-white drop-shadow-lg mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">Current Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/60 font-medium" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-500">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">New Password</label>
                    <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/60 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/60 font-medium" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSavePassword} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    <Save className="w-5 h-5" />
                    Update Password
                  </motion.button>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="border-t border-white/20 pt-6">
                <h3 className="text-lg font-bold text-white drop-shadow-lg mb-4">Two-Factor Authentication</h3>
                <p className="text-white/90 font-medium drop-shadow-md mb-4">Add an extra layer of security to your account.</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">Enable 2FA</motion.button>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border-t pt-6">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                  Logout
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white drop-shadow-lg">Notification Preferences</h3>

              <div className="space-y-4 pb-6 border-b border-white/20">
                <h4 className="font-bold text-white drop-shadow-lg">Issues</h4>
                <div className="flex items-center justify-between p-4 glass-card-light rounded-lg">
                  <div>
                    <p className="font-semibold text-white drop-shadow-md">Issue Assigned</p>
                    <p className="text-sm text-white/80 font-medium drop-shadow-sm">Notify when a new issue is assigned to you</p>
                  </div>
                  <button onClick={() => handleNotificationToggle('issueAssigned')} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${notifications.issueAssigned ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${notifications.issueAssigned ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 glass-card-light rounded-lg">
                  <div>
                    <p className="font-semibold text-white drop-shadow-md">Issue Resolved</p>
                    <p className="text-sm text-white/80 font-medium drop-shadow-sm">Notify when an issue is marked as resolved</p>
                  </div>
                  <button onClick={() => handleNotificationToggle('issueResolved')} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${notifications.issueResolved ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${notifications.issueResolved ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 pb-6 border-b border-white/20">
                <h4 className="font-bold text-white drop-shadow-lg">Reports</h4>
                <div className="flex items-center justify-between p-4 glass-card-light rounded-lg">
                  <div>
                    <p className="font-semibold text-white drop-shadow-md">Daily Summary</p>
                    <p className="text-sm text-white/80 font-medium drop-shadow-sm">Daily summary of issues and activities</p>
                  </div>
                  <button onClick={() => handleNotificationToggle('dailySummary')} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${notifications.dailySummary ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${notifications.dailySummary ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 glass-card-light rounded-lg">
                  <div>
                    <p className="font-semibold text-white drop-shadow-md">Weekly Report</p>
                    <p className="text-sm text-white/80 font-medium drop-shadow-sm">Weekly performance and resolution report</p>
                  </div>
                  <button onClick={() => handleNotificationToggle('weeklyReport')} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${notifications.weeklyReport ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${notifications.weeklyReport ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white drop-shadow-lg">Notification Channels</h4>
                <div className="flex items-center justify-between p-4 glass-card-light rounded-lg">
                  <div>
                    <p className="font-semibold text-white drop-shadow-md">Email Notifications</p>
                    <p className="text-sm text-white/80 font-medium drop-shadow-sm">Receive notifications via email</p>
                  </div>
                  <button onClick={() => handleNotificationToggle('email')} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${notifications.email ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${notifications.email ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 glass-card-light rounded-lg">
                  <div>
                    <p className="font-semibold text-white drop-shadow-md">In-App Notifications</p>
                    <p className="text-sm text-white/80 font-medium drop-shadow-sm">Receive notifications in the application</p>
                  </div>
                  <button onClick={() => handleNotificationToggle('inApp')} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${notifications.inApp ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${notifications.inApp ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button onClick={handleSaveProfile} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <Save className="w-5 h-5" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white drop-shadow-lg">Privacy & Data Management</h3>

              <div className="space-y-4 pb-6 border-b border-white/20">
                <h4 className="font-bold text-white drop-shadow-lg">Appearance</h4>
                <div className="flex items-center justify-between p-4 glass-card-light rounded-lg">
                  <div className="flex items-center gap-3">
                    {preferences.darkMode ? (
                      <Moon className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-semibold text-white drop-shadow-md">Dark Mode</p>
                      <p className="text-sm text-white/80 font-medium drop-shadow-sm">Use dark theme for easier viewing</p>
                    </div>
                  </div>
                  <button onClick={() => handlePreferenceToggle('darkMode')} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${preferences.darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${preferences.darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 pb-6 border-b border-white/20">
                <h4 className="font-bold text-white drop-shadow-lg">Data & Privacy</h4>
                <div className="flex items-center justify-between p-4 glass-card-light rounded-lg">
                  <div>
                    <p className="font-semibold text-white drop-shadow-md">Share Analytics Data</p>
                    <p className="text-sm text-white/80 font-medium drop-shadow-sm">Help improve the app by sharing anonymous usage data</p>
                  </div>
                  <button onClick={() => handlePreferenceToggle('shareData')} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${preferences.shareData ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${preferences.shareData ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 glass-card-light rounded-lg">
                  <div>
                    <p className="font-semibold text-white drop-shadow-md">Marketing Emails</p>
                    <p className="text-sm text-white/80 font-medium drop-shadow-sm">Receive emails about new features and updates</p>
                  </div>
                  <button onClick={() => handlePreferenceToggle('marketingEmails')} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${preferences.marketingEmails ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${preferences.marketingEmails ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 glass-card-light rounded-lg">
                  <div>
                    <p className="font-semibold text-white drop-shadow-md">Show Activity Status</p>
                    <p className="text-sm text-white/80 font-medium drop-shadow-sm">Let others see when you're active in the system</p>
                  </div>
                  <button onClick={() => handlePreferenceToggle('showActivity')} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${preferences.showActivity ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${preferences.showActivity ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 pb-6 border-b border-white/20">
                <h4 className="font-bold text-white drop-shadow-lg">Data Management</h4>
                <div className="glass-card-light border border-blue-400/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-white font-semibold drop-shadow-md">Your data is securely stored and can be downloaded or deleted at any time.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleDownloadData} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                    <Download className="w-4 h-4" />
                    Download My Data
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white drop-shadow-lg">Account Actions</h4>
                <button onClick={handleDeleteAccount} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all hover:scale-105 font-semibold shadow-lg">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
                <p className="text-sm text-white/80 font-medium drop-shadow-sm">Permanently delete your account and all associated data</p>
              </div>

              <div className="flex gap-3 pt-6">
                <button onClick={handleSaveProfile} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <Save className="w-5 h-5" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

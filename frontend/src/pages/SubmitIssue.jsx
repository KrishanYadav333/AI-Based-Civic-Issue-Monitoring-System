import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Camera, MapPin, Upload, AlertCircle } from 'lucide-react';
import { createIssue } from '../store/issueSlice';
import { issueService } from '../services/api';
import TopUtilityBar from '../components/common/TopUtilityBar';
import VMCHeader from '../components/common/VMCHeader';
import VMCFooter from '../components/common/VMCFooter';

const SubmitIssue = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    description: '',
    image: null,
  });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError('Unable to get location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to submit an issue');
        setTimeout(() => navigate('/login'), 2000);
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.latitude || !formData.longitude) {
        throw new Error('Please provide location');
      }
      if (!formData.image) {
        throw new Error('Please upload an image');
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('image', formData.image);
      submitData.append('latitude', formData.latitude);
      submitData.append('longitude', formData.longitude);
      if (formData.description) {
        submitData.append('description', formData.description);
      }

      // Submit to backend
      const response = await issueService.createIssue(submitData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login'); // Redirect to login or appropriate page
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopUtilityBar />
      <VMCHeader />
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#0056b3] text-white shadow-md">
        <div className="px-4 md:px-10 py-3 flex items-center justify-between">
          <ul className="hidden md:flex items-center gap-1 text-sm font-medium">
            <li className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/')}>Home</li>
            <li className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer border-l border-white/20">Report Issue</li>
            <li className="px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer border-l border-white/20" onClick={() => navigate('/login')}>Track Status</li>
          </ul>
          <button 
            onClick={() => navigate('/login')}
            className="bg-white text-[#0056b3] px-6 py-2 rounded-sm font-bold text-sm hover:bg-slate-100 transition-colors"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-sm shadow-lg p-8 border border-slate-200">
            <h1 className="text-3xl font-bold text-[#003366] mb-2 uppercase tracking-wide">Report Civic Issue</h1>
            <p className="text-slate-600 mb-6">Help us improve Vadodara by reporting civic issues</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm mb-6 flex items-start gap-2">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-sm mb-6">
                Issue submitted successfully! Redirecting...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Location
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-sm border border-slate-300 flex items-center justify-center gap-2 transition-colors"
                >
                  <MapPin size={20} />
                  Get Current Location
                </button>
                {formData.latitude && formData.longitude && (
                  <p className="mt-2 text-sm text-slate-600">
                    📍 Latitude: {formData.latitude.toFixed(6)}, Longitude: {formData.longitude.toFixed(6)}
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Upload Image *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-sm p-8 text-center hover:border-[#0056b3] transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {formData.image ? (
                      <div>
                        <img 
                          src={URL.createObjectURL(formData.image)} 
                          alt="Preview" 
                          className="max-h-64 mx-auto mb-4 rounded-sm"
                        />
                        <p className="text-sm text-slate-600">{formData.image.name}</p>
                      </div>
                    ) : (
                      <div>
                        <Camera size={48} className="mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-600 mb-2">Click to upload image</p>
                        <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-[#0056b3] focus:border-transparent"
                  placeholder="Provide additional details about the issue..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.latitude || !formData.image}
                className="w-full bg-[#003366] hover:bg-[#002244] disabled:bg-slate-400 text-white px-8 py-4 rounded-sm font-bold uppercase tracking-wide transition-colors shadow-md disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Issue'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-sm">
              <p className="text-sm text-[#003366] font-semibold mb-2">📋 Note:</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• AI will automatically detect the issue type</li>
                <li>• Issues are assigned to nearest ward engineer</li>
                <li>• You can track status after submission</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <VMCFooter />
    </div>
  );
};

export default SubmitIssue;

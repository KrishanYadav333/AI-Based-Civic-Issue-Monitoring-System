import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { issueService } from '../services/api';
import { fetchIssues } from '../store/issueSlice';
import { motion } from 'framer-motion';
import { Camera, MapPin, FileText, AlertCircle, Upload, X, CheckCircle } from 'lucide-react';

const ISSUE_TYPES = [
  { value: 'pothole', label: '🕳️ Pothole', icon: '🕳️' },
  { value: 'garbage', label: '🗑️ Garbage/Waste', icon: '🗑️' },
  { value: 'streetlight', label: '💡 Street Light Issue', icon: '💡' },
  { value: 'drainage', label: '🚰 Drainage Problem', icon: '🚰' },
  { value: 'water_supply', label: '💧 Water Supply', icon: '💧' },
  { value: 'road_damage', label: '🛣️ Road Damage', icon: '🛣️' },
  { value: 'illegal_construction', label: '🏗️ Illegal Construction', icon: '🏗️' },
  { value: 'encroachment', label: '⚠️ Encroachment', icon: '⚠️' },
  { value: 'other', label: '📋 Other', icon: '📋' },
];

const ReportIssue = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [formData, setFormData] = useState({
    issueType: '',
    description: '',
    priority: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Auto-fetch location on page load
    getLocation();
    
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setLoadingLocation(true);
      
      // Get location first
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const loc = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setLocation(loc);

      // Reverse geocode
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}`
        );
        const data = await response.json();
        setAddress(data.display_name || 'Address not found');
      } catch {
        setAddress('Address not available');
      }

      setLoadingLocation(false);

      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setUseCamera(true);
    } catch (error) {
      setLoadingLocation(false);
      if (error.code === 1 || error.PERMISSION_DENIED) {
        alert('❌ Location permission is required. Please enable location access.');
      } else {
        alert('❌ Unable to access camera or location. Please check your permissions.');
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        handleImageFile(file);
        stopCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  const handleImageFile = (file) => {
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const getLocation = async () => {
    setLoadingLocation(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const loc = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setLocation(loc);

      // Reverse geocode
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}`
        );
        const data = await response.json();
        setAddress(data.display_name || 'Address not found');
      } catch {
        setAddress('Vadodara, Gujarat');
      }
    } catch (error) {
      alert('Location access denied or unavailable');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert('Please capture or upload an image');
      return;
    }

    if (!location) {
      alert('Please get your current location');
      return;
    }

    if (!formData.issueType) {
      alert('Please select an issue type');
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', image);
      formDataToSend.append('issue_type', formData.issueType);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('latitude', location.latitude);
      formDataToSend.append('longitude', location.longitude);
      formDataToSend.append('address', address);

      await issueService.createIssue(formDataToSend);

      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        dispatch(fetchIssues());
        navigate('/surveyor/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Error submitting issue: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 text-lg">Issue reported successfully</p>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0056b3] rounded-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0a2647]">Report Civic Issue</h1>
                <p className="text-gray-600">Capture and document problems</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/surveyor/dashboard')}
              className="px-4 py-2 text-[#0056b3] hover:bg-blue-50 rounded-lg transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Capture */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
              <Camera className="w-5 h-5" />
              Photo Evidence *
            </label>

            {!imagePreview && !useCamera && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={loadingLocation}
                  className="w-full bg-[#0056b3] text-white py-4 rounded-xl font-medium hover:bg-[#004494] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {loadingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      Use Camera (Location Required)
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gray-600 text-white py-4 rounded-xl font-medium hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {useCamera && (
              <div className="space-y-3">
                {location && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                    ✅ Location captured: {address.substring(0, 50)}...
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={!location}
                    className="flex-1 bg-[#0056b3] text-white py-3 rounded-lg font-medium hover:bg-[#004494] disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Capture
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {imagePreview && (
              <div className="space-y-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Remove Photo
                </button>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
              <MapPin className="w-5 h-5" />
              Location *
            </label>

            {!location ? (
              <button
                type="button"
                onClick={getLocation}
                disabled={loadingLocation}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5" />
                    Get Current Location
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Location Captured
                  </p>
                  <p className="text-xs text-green-600 mt-1">{address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={getLocation}
                  className="w-full bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700 flex items-center justify-center gap-2"
                >
                  Update Location
                </button>
              </div>
            )}
          </div>

          {/* Issue Type */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
              <FileText className="w-5 h-5" />
              Issue Type *
            </label>
            <select
              value={formData.issueType}
              onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056b3]"
              required
            >
              <option value="">Select issue type</option>
              {ISSUE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
              <FileText className="w-5 h-5" />
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0056b3]"
              rows="4"
              placeholder="Describe the issue in detail..."
              required
              minLength="10"
            />
          </div>

          {/* Priority */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
              <AlertCircle className="w-5 h-5" />
              Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['low', 'medium', 'high'].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  className={`py-3 rounded-lg font-medium border-2 transition-colors ${
                    formData.priority === priority
                      ? 'border-[#0056b3] bg-blue-50 text-[#0056b3]'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0056b3] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#004494] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Submit Issue
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;

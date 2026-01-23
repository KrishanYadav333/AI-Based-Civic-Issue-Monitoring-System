import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ISSUE_TYPES } from '../config/constants';
import offlineStorage from '../services/offlineStorage';
import apiService from '../services/api';
import { addIssue, updateIssue } from '../store/issueSlice';
import logo from '../assets/images/vmc_logo.jpg';

export default function ReportIssue() {
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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Reset form when component mounts and unmounts
  useEffect(() => {
    // Clear on mount
    setImage(null);
    setImagePreview(null);
    setUseCamera(false);
    setLocation(null);
    setAddress('');
    setFormData({
      issueType: '',
      description: '',
      priority: 'medium',
    });
    setSubmitting(false);
    setLoadingLocation(false);

    // Cleanup on unmount
    return () => {
      setImage(null);
      setImagePreview(null);
      setUseCamera(false);
      setLocation(null);
      setAddress('');
      setFormData({
        issueType: '',
        description: '',
        priority: 'medium',
      });
      setSubmitting(false);
      setLoadingLocation(false);
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (useCamera) {
      startCameraWithLocation();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [useCamera]);

  const startCameraWithLocation = async () => {
    try {
      // First, get location permission - MANDATORY
      setLoadingLocation(true);
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

      // Reverse geocode to get address
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

      // Now start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setLoadingLocation(false);
      if (error.code === 1) {
        alert('❌ Location permission is required to use camera. Please enable location access.');
      } else if (error.PERMISSION_DENIED || error.code === error.PERMISSION_DENIED) {
        alert('❌ Location permission denied. Camera requires location access.');
      } else if (error.message?.includes('getUserMedia')) {
        alert('❌ Camera access denied.');
      } else {
        alert('❌ Unable to get location. Please check your location settings and try again.');
      }
      setUseCamera(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert('Camera access denied.');
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
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
        setUseCamera(false);
      }, 'image/jpeg', 0.8);
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

      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });

      const addressText = await apiService.reverseGeocode(latitude, longitude);
      setAddress(addressText);
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

    setSubmitting(true);

    try {
      // Save locally first
      const issueData = {
        ...formData,
        imageUri: imagePreview,
        location,
        address,
      };

      const savedIssue = await offlineStorage.saveIssue(issueData);
      dispatch(addIssue(savedIssue));

      // Clear form and reset state IMMEDIATELY after saving (before sync)
      const tempImage = image;
      const tempFormData = { ...formData };
      const tempLocation = { ...location };
      const tempAddress = address;

      // Clear UI immediately
      setImage(null);
      setImagePreview(null);
      setUseCamera(false);
      setLocation(null);
      setAddress('');
      setFormData({
        issueType: '',
        description: '',
        priority: 'medium',
      });
      setLoadingLocation(false);
      
      // Stop camera immediately
      stopCamera();

      // Try to sync if online (using temp variables)
      if (navigator.onLine) {
        try {
          const formDataToSend = new FormData();
          formDataToSend.append('image', tempImage);
          formDataToSend.append('issueType', tempFormData.issueType);
          formDataToSend.append('description', tempFormData.description);
          formDataToSend.append('priority', tempFormData.priority);
          formDataToSend.append('latitude', tempLocation.latitude);
          formDataToSend.append('longitude', tempLocation.longitude);
          formDataToSend.append('address', tempAddress);

          const result = await apiService.createIssue(formDataToSend);
          
          await offlineStorage.markAsSynced(savedIssue.localId, result.data.id);
          dispatch(updateIssue({ localId: savedIssue.localId, synced: true, serverId: result.data.id }));
          
          setSuccessMessage('✅ Issue reported and synced successfully!');
          setShowSuccessPopup(true);
        } catch (syncError) {
          setSuccessMessage('✅ Issue saved offline. Will sync when online.');
          setShowSuccessPopup(true);
        }
      } else {
        setSuccessMessage('✅ Issue saved offline. Will sync when online.');
        setShowSuccessPopup(true);
      }

      // Set submitting to false and navigate after showing popup
      setSubmitting(false);
      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate('/', { replace: true });
      }, 2500);
    } catch (error) {
      alert('Error saving issue: ' + error.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-card-strong rounded-3xl p-8 max-w-md mx-4 shadow-2xl transform scale-100 animate-bounce-in">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
              <p className="text-white/90 text-lg">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation with Glassmorphism */}
      <div className="glass-card-strong border-b border-white/20 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src={logo} alt="VMC" className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shadow-lg" />
          <h1 className="text-xl font-bold text-white drop-shadow-md">CivicLens — Field Surveyor</h1>
        </div>
        <button onClick={() => navigate('/')} className="px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-all">
          ← Back to Dashboard
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="glass-card rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600/50 to-blue-500/50 backdrop-blur-xl px-6 py-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-md">Capture Issue</h2>
                <p className="text-white/80">Document and report civic problems</p>
              </div>
            </div>
          </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Image Capture */}
        <div className="glass-card-light rounded-2xl p-5 border border-white/20">
          <label className="flex items-center gap-2 font-bold text-white mb-4 text-lg drop-shadow-md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Attach Photo *
          </label>

          {!imagePreview && !useCamera && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setUseCamera(true)}
                disabled={loadingLocation}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
              >
                {loadingLocation ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Use Camera (Location Required)
                  </>
                )}
              </button>
              <p className="text-sm text-gray-600 text-center flex items-center justify-center gap-1">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Location access is required to capture photos
              </p>
            </div>
          )}

          {useCamera && (
            <div className="space-y-3">
              {location && (
                <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                  <p className="text-green-800">
                    ✅ Location captured: {address?.substring(0, 50)}...
                  </p>
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
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 btn-touch disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Capture
                </button>
                <button
                  type="button"
                  onClick={() => setUseCamera(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 btn-touch"
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
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 btn-touch flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove Photo
              </button>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <label className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location *
          </label>
          
          {!location ? (
            <button
              type="button"
              onClick={getLocation}
              disabled={loadingLocation}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 btn-touch flex items-center justify-center gap-2"
            >
              {loadingLocation ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Getting Location...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Get Current Location
                </>
              )}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
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
                className="w-full bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700 btn-touch flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Update Location
              </button>
            </div>
          )}
        </div>

        {/* Issue Type */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <label className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Issue Type *
          </label>
          <select
            value={formData.issueType}
            onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select issue type</option>
            {ISSUE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <label className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Describe the issue in detail..."
            required
            minLength="10"
          />
        </div>

        {/* Priority */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <label className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Priority
          </label>
          <div className="flex gap-3">
            {['low', 'medium', 'high'].map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => setFormData({ ...formData, priority })}
                className={`flex-1 py-3 rounded-lg font-medium border-2 transition-colors btn-touch ${
                  formData.priority === priority
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
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
          className="w-full bg-blue-600 text-white py-4 rounded font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Submit Issue
            </>
          )}
        </button>
      </form>
        </div>
      </div>
    </div>
  );
}

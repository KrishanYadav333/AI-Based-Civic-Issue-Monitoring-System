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
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (useCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [useCamera]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert('Camera access denied. Please use file upload.');
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

      // Try to sync if online
      if (navigator.onLine) {
        try {
          const formDataToSend = new FormData();
          formDataToSend.append('image', image);
          formDataToSend.append('issueType', formData.issueType);
          formDataToSend.append('description', formData.description);
          formDataToSend.append('priority', formData.priority);
          formDataToSend.append('latitude', location.latitude);
          formDataToSend.append('longitude', location.longitude);
          formDataToSend.append('address', address);

          const result = await apiService.createIssue(formDataToSend);
          
          await offlineStorage.markAsSynced(savedIssue.localId, result.data.id);
          dispatch(updateIssue({ localId: savedIssue.localId, synced: true, serverId: result.data.id }));
          
          alert('✅ Issue reported and synced successfully!');
        } catch (syncError) {
          alert('✅ Issue saved offline. Will sync when online.');
        }
      } else {
        alert('✅ Issue saved offline. Will sync when online.');
      }

      navigate('/');
    } catch (error) {
      alert('Error saving issue: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="VMC" className="w-10 h-10 rounded-full object-cover" />
          <h1 className="text-xl font-bold text-gray-800">CivicLens — Field Surveyor Web App</h1>
        </div>
        <button onClick={() => navigate('/')} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
          ← Back to Dashboard
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">📷 Capture Issue</h2>
            <p className="text-blue-100">Document and report civic problems</p>
          </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Image Capture */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <label className="block font-bold text-gray-800 mb-4 text-lg">
            📸 Attach Photo *
          </label>

          {!imagePreview && !useCamera && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setUseCamera(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors btn-touch"
              >
                📷 Use Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors btn-touch"
              >
                📁 Upload Photo
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
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 btn-touch"
                >
                  📸 Capture
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
                className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 btn-touch"
              >
                🗑️ Remove Photo
              </button>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <label className="block font-bold text-gray-800 mb-4 text-lg">
            📍 Location *
          </label>
          
          {!location ? (
            <button
              type="button"
              onClick={getLocation}
              disabled={loadingLocation}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 btn-touch"
            >
              {loadingLocation ? '🔄 Getting Location...' : '📍 Get Current Location'}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800">✅ Location Captured</p>
                <p className="text-xs text-green-600 mt-1">{address}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
              <button
                type="button"
                onClick={getLocation}
                className="w-full bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700 btn-touch"
              >
                🔄 Update Location
              </button>
            </div>
          )}
        </div>

        {/* Issue Type */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
          <label className="block font-bold text-gray-800 mb-4 text-lg">
            🏷️ Issue Type *
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
          <label className="block font-bold text-gray-800 mb-4 text-lg">
            📝 Description *
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
          <label className="block font-bold text-gray-800 mb-4 text-lg">
            ⚠️ Priority
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
          className="w-full bg-blue-600 text-white py-4 rounded font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {submitting ? '🔄 Submitting...' : 'Submit Issue'}
        </button>
      </form>
        </div>
      </div>
    </div>
  );
}

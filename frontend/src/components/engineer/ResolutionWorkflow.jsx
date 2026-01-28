import React, { useState, memo } from 'react';
import { useDispatch } from 'react-redux';
import { resolveIssue } from '../../store/issueSlice';
import { 
  CheckCircle, Upload, AlertCircle, Clock, MapPin, User, 
  Calendar, MessageCircle, X, ChevronRight, ImagePlus
} from 'lucide-react';
import { motion } from 'framer-motion';

// VMC Government Colors
const VMC_COLORS = {
  primary: '#003366',
  primaryBlue: '#0056b3',
  orange: '#e67e22',
  green: '#27ae60',
};

const ResolutionWorkflow = ({ issue, onClose }) => {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    resolutionNotes: '',
    resolutionImages: [],
    findings: '',
    actionsTaken: ''
  });

  const steps = [
    { id: 'review', label: 'Review Issue', icon: AlertCircle },
    { id: 'accept', label: 'Accept & Start', icon: CheckCircle },
    { id: 'document', label: 'Document Work', icon: Upload },
    { id: 'complete', label: 'Mark Resolved', icon: CheckCircle }
  ];

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData(prev => ({
            ...prev,
            resolutionImages: [...prev.resolutionImages, {
              data: event.target.result,
              name: file.name,
              uploadedAt: new Date().toISOString()
            }]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      resolutionImages: prev.resolutionImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.resolutionNotes.trim()) {
      alert('Please add resolution notes');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(resolveIssue({
        id: issue.id,
        data: {
          status: 'resolved',
          resolutionNotes: formData.resolutionNotes,
          resolutionImages: formData.resolutionImages,
          findings: formData.findings,
          actionsTaken: formData.actionsTaken
        }
      })).unwrap();
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error('Failed to resolve issue:', error);
      alert('Failed to resolve issue. Please try again.');
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-96 overflow-hidden flex flex-col shadow-xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 border-b border-gray-200 px-6 py-5 flex items-center justify-between" style={{ background: `linear-gradient(to right, ${VMC_COLORS.primary}, ${VMC_COLORS.primaryBlue})` }}>
          <div>
            <h2 className="text-2xl font-bold text-white">Resolution Workflow</h2>
            <p className="text-sm text-blue-100 mt-1">Issue {issue.id} - {issue.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;

              return (
                <div key={step.id} className="flex items-center gap-2 flex-1">
                  <motion.div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm transition-all ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isActive
                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                  </motion.div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 rounded-full transition-all ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full"
              style={{ background: `linear-gradient(to right, ${VMC_COLORS.primaryBlue}, ${VMC_COLORS.green})` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {currentStep === 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">Review Issue Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium uppercase">Priority</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{issue.priority}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium uppercase">Ward</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{issue.ward}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium uppercase">Date</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{issue.createdAt}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-medium uppercase">Status</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{issue.status}</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Description</p>
                <p className="text-sm text-blue-800">{issue.description}</p>
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">Accept & Start Resolution</h3>
              <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-emerald-900 mb-2">Ready to start?</p>
                <p className="text-xs text-emerald-700">Click Next to begin the resolution process</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-900">What to do next:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Review the issue details above</li>
                  <li>✓ Proceed to document your work</li>
                  <li>✓ Upload before & after images</li>
                  <li>✓ Mark as resolved when complete</li>
                </ul>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">Document Your Work</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actions Taken
                </label>
                <textarea
                  value={formData.actionsTaken}
                  onChange={(e) => setFormData({ ...formData, actionsTaken: e.target.value })}
                  placeholder="Describe the actions you took to resolve this issue..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Findings
                </label>
                <textarea
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                  placeholder="Any findings or notes during the work..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImagePlus className="w-4 h-4 inline mr-2" />
                  Upload Evidence Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-600 file:px-3 file:py-1 file:rounded-lg file:border-0 file:text-sm file:bg-emerald-100 file:text-emerald-700"
                />
                {formData.resolutionImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {formData.resolutionImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img.data} alt="Evidence" className="rounded-lg w-full h-20 object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">Mark as Resolved</h3>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm font-medium text-emerald-900 mb-2">Resolution Notes</p>
                <textarea
                  value={formData.resolutionNotes}
                  onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
                  placeholder="Final notes about the resolution..."
                  className="w-full px-4 py-2 border border-emerald-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Summary</p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Actions: {formData.actionsTaken ? '✓' : '○'}</li>
                  <li>• Findings: {formData.findings ? '✓' : '○'}</li>
                  <li>• Images: {formData.resolutionImages.length > 0 ? `✓ (${formData.resolutionImages.length})` : '○'}</li>
                  <li>• Resolution Notes: {formData.resolutionNotes ? '✓' : '○'}</li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Back
          </button>

          <div className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium flex items-center gap-2"
              style={{ backgroundColor: VMC_COLORS.primaryBlue }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              style={{ backgroundColor: VMC_COLORS.green }}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Resolution'}
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default memo(ResolutionWorkflow);

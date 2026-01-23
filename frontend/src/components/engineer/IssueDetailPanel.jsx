import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateIssue, addComment } from '../../store/issueSlice';
import { Modal, Button, Input } from '../common/FormElements';
import { PriorityBadge, StatusBadge } from '../common/Badges';
import ResolutionWorkflow from './ResolutionWorkflow';
import {
  MapPin,
  Calendar,
  User,
  MessageCircle,
  Upload,
  CheckCircle,
  X,
  Camera,
  Zap,
} from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';
import { motion } from 'framer-motion';
import TrustBadge from '../common/TrustBadge';
import CivicVoiceWidget from '../common/CivicVoiceWidget';

const IssueDetailPanel = ({ isOpen = true, onClose, issue }) => {
  if (!issue) return null;
  const dispatch = useDispatch();
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newComment, setNewComment] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isResolving, setIsResolving] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    dispatch(addComment({
      author: 'Current User',
      date: new Date().toLocaleDateString(),
      text: newComment,
    }));
    setNewComment('');
  };

  const handleResolveIssue = () => {
    if (!resolutionNotes.trim()) {
      alert('Please add resolution notes');
      return;
    }

    setIsResolving(true);
    setTimeout(() => {
      dispatch(updateIssue({
        ...issue,
        status: 'resolved',
        resolutionDate: new Date().toISOString().split('T')[0],
        notes: resolutionNotes,
        resolutionImages: uploadedImages,
      }));
      setIsResolving(false);
      setResolutionNotes('');
      setUploadedImages([]);
      onClose();
    }, 500);
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImages(prev => [...prev, event.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Issue ${issue?.id}`}>
      <div className="space-y-6">
        {/* Header Info */}
        <div className="space-y-3">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{issue?.title}</h3>
            <p className="text-gray-600 mt-2">{issue?.description}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <PriorityBadge priority={issue?.priority} />
            <StatusBadge status={issue?.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{issue?.ward}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDateTime(issue?.createdDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span>{issue?.createdBy}</span>
            </div>
            {issue?.resolutionDate && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Resolved: {issue.resolutionDate}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Reporter Trust:</span>
            <TrustBadge userId={issue?.submittedBy} />
          </div>

          <div className="mt-4">
            <CivicVoiceWidget issueId={issue?.id} initialUpvotes={issue?.upvotes || 0} />
          </div>
        </div>

        {/* Images */}
        {issue?.images && issue.images.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Issue Images</h4>
            <div className="grid grid-cols-2 gap-3">
              {issue.images.map((img, idx) => (
                <img key={idx} src={img} alt="Issue" className="rounded-lg w-full h-32 object-cover" />
              ))}
            </div>
          </div>
        )}

        {/* Resolution Section */}
        {issue?.status !== 'resolved' && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Mark as Resolved</h4>
              <motion.button
                onClick={() => setWorkflowOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-shadow"
              >
                <Zap size={16} />
                Start Workflow
              </motion.button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how you resolved this issue..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Camera className="w-4 h-4 inline mr-2" />
                Resolution Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-900"
              />
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img} alt="Uploaded" className="rounded w-full h-20 object-cover" />
                      <button
                        onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleResolveIssue}
              loading={isResolving}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Resolved
            </Button>
          </div>
        )}

        {/* Comments Section */}
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comments
          </h4>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {issue?.comments && issue.comments.map((comment, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {comment.author}
                    </p>
                    <p className="text-xs text-gray-500">{comment.date}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2">{comment.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <Button onClick={handleAddComment} variant="primary" size="sm">
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Resolution Workflow Modal */}
      {workflowOpen && (
        <ResolutionWorkflow
          issue={issue}
          onClose={() => setWorkflowOpen(false)}
        />
      )}
    </Modal>
  );
};

export default IssueDetailPanel;

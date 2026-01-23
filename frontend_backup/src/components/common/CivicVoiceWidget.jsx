import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, TrendingUp, Users } from 'lucide-react';
import axios from '../../services/api';

const CivicVoiceWidget = ({ issueId, initialUpvotes = 0 }) => {
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [hasVoted, setHasVoted] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [escalated, setEscalated] = useState(false);

    useEffect(() => {
        // Check if current user already voted
        const checkVote = async () => {
            try {
                const response = await axios.get(`/premium/issues/${issueId}/vote-status`);
                setHasVoted(response.data.hasVoted);
            } catch (err) {
                // Silent error
            }
        };
        checkVote();
    }, [issueId]);

    const handleVote = async () => {
        if (processing || hasVoted) return;

        setProcessing(true);
        try {
            // Optimistic update
            setUpvotes(prev => prev + 1);
            setHasVoted(true);

            const response = await axios.post(`/premium/issues/${issueId}/vote`);

            if (response.data.data.priority === 'critical') {
                setEscalated(true);
            }

            // Update with server truth
            setUpvotes(response.data.data.upvotes);

        } catch (error) {
            console.error('Vote failed', error);
            // Revert optimism
            setUpvotes(prev => prev - 1);
            setHasVoted(false);
        } finally {
            setProcessing(false);
        }
    };

    const progress = Math.min((upvotes / 50) * 100, 100);

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Civic Voice
                </h3>
                {escalated && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200"
                    >
                        CRITICAL ESCALATION
                    </motion.span>
                )}
            </div>

            <div className="flex items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVote}
                    disabled={hasVoted || processing}
                    className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${hasVoted
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 cursor-default'
                            : 'bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
                        }`}
                >
                    <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
                    {hasVoted ? 'Voted' : 'Prioritize This'}
                </motion.button>

                <div className="text-center min-w-[60px]">
                    <span className="text-2xl font-bold block leading-none">{upvotes}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Voices</span>
                </div>
            </div>

            <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Auto-Escalation Progress</span>
                    <span className="font-semibold text-blue-600">{upvotes}/50</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
                {progress >= 100 ? (
                    <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Community mandated priority!
                    </p>
                ) : (
                    <p className="text-[10px] text-gray-400 mt-2">
                        Reach 50 votes to override AI priority and alert admins immediately.
                    </p>
                )}
            </div>
        </div>
    );
};

export default CivicVoiceWidget;

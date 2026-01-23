import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Award } from 'lucide-react';
import axios from '../../services/api';

const TrustBadge = ({ userId }) => {
    const [trust, setTrust] = useState({ score: 2.5, action: 'standard' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrust = async () => {
            try {
                // In a real app, we might batch this or pass it as prop if already known
                // For now, fetching individually for demo
                const response = await axios.get(`/premium/users/${userId}/trust`);
                setTrust({
                    score: response.data.trust_score,
                    action: response.data.triage_action
                });
            } catch (error) {
                console.error('Failed to trust', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchTrust();
        }
    }, [userId]);

    if (loading) return null;

    const getBadgeConfig = () => {
        if (trust.score >= 4.5) {
            return {
                label: 'Elite Surveyor',
                color: 'bg-gradient-to-r from-purple-500 to-indigo-600',
                icon: Award,
                textColor: 'text-white'
            };
        } else if (trust.score >= 3.5) {
            return {
                label: 'Trusted Source',
                color: 'bg-green-100 border border-green-200',
                icon: ShieldCheck,
                textColor: 'text-green-800'
            };
        } else if (trust.score <= 2.0) {
            return {
                label: 'Low Integrity',
                color: 'bg-red-100 border border-red-200',
                icon: ShieldAlert,
                textColor: 'text-red-800'
            };
        }
        return null; // Standard user, no badge
    };

    const config = getBadgeConfig();

    if (!config) return null;

    const Icon = config.icon;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${config.color} ${config.textColor}`}
        >
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
            {trust.score >= 4.5 && <span className="ml-1 opacity-75">★ {trust.score.toFixed(1)}</span>}
        </motion.div>
    );
};

export default TrustBadge;

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Ribbon } from 'lucide-react';
import axios from '../../services/api';

const Leaderboard = () => {
    // Mock data for demo if API fails
    const [surveyors, setSurveyors] = useState([
        { id: 1, name: 'Priya P.', score: 450, verified: 12 },
        { id: 2, name: 'Rahul K.', score: 320, verified: 8 },
        { id: 3, name: 'Amit S.', score: 280, verified: 7 },
    ]);
    const [engineers, setEngineers] = useState([
        { id: 1, name: 'Eng. Vijay', score: 98, resolved: 45 },
        { id: 2, name: 'Eng. Sarah', score: 95, resolved: 42 },
    ]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {/* Surveyors */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-5 shadow-sm"
            >
                <h3 className="flex items-center gap-2 font-bold text-lg text-purple-900 mb-4">
                    <Ribbon className="w-5 h-5 text-purple-600" />
                    Top Citizens
                </h3>
                <div className="space-y-3">
                    {surveyors.map((user, idx) => (
                        <div key={user.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {idx + 1}
                                </span>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.verified} verified reports</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-purple-600">{user.score} pts</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Engineers */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-xl p-5 shadow-sm"
            >
                <h3 className="flex items-center gap-2 font-bold text-lg text-blue-900 mb-4">
                    <Trophy className="w-5 h-5 text-blue-600" />
                    Top Engineers
                </h3>
                <div className="space-y-3">
                    {engineers.map((user, idx) => (
                        <div key={user.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {idx + 1}
                                </span>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.resolved} issues fixed</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-blue-600">{user.score}%</span>
                                <span className="text-[10px] text-green-600 bg-green-50 px-1 rounded">SLA Compliant</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Leaderboard;

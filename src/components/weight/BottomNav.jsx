import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CalendarDays, CalendarRange, Settings } from 'lucide-react';

const tabs = [
    { id: 'daily', label: 'Diário', icon: Calendar },
    { id: 'weekly', label: 'Semanal', icon: CalendarDays },
    { id: 'monthly', label: 'Mensal', icon: CalendarRange },
    { id: 'settings', label: 'Config', icon: Settings },
];

export default function BottomNav({ activeTab, onTabChange }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-2 pb-safe">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="relative flex flex-col items-center justify-center w-16 h-full"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-x-2 top-1 h-1 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon className={`w-5 h-5 mb-1 transition-colors ${isActive ? 'text-rose-500' : 'text-gray-400'
                                }`} />
                            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-rose-500' : 'text-gray-400'
                                }`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
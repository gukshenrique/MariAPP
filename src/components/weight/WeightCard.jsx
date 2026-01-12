import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export default function WeightCard({ title, value, unit, change, subtitle, icon: Icon, color = "coral" }) {
    const isPositive = change > 0;
    const isNegative = change < 0;
    const isNeutral = change === 0 || change === null || change === undefined;

    const colorClasses = {
        coral: "bg-gradient-to-br from-rose-50 to-orange-50 border-rose-100",
        green: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100",
        purple: "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100",
        blue: "bg-gradient-to-br from-sky-50 to-blue-50 border-sky-100"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl p-5 border ${colorClasses[color]} shadow-sm`}
        >
            <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</span>
                {Icon && <Icon className="w-4 h-4 text-gray-400" />}
            </div>

            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{value}</span>
                <span className="text-sm text-gray-500">{unit}</span>
            </div>

            {change !== null && change !== undefined && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${isNegative ? 'text-emerald-600' : isPositive ? 'text-rose-500' : 'text-gray-500'
                    }`}>
                    {isNegative ? <TrendingDown className="w-4 h-4" /> :
                        isPositive ? <TrendingUp className="w-4 h-4" /> :
                            <Minus className="w-4 h-4" />}
                    <span className="font-medium">
                        {isNegative ? '' : '+'}{change.toFixed(2)} kg
                    </span>
                </div>
            )}

            {subtitle && (
                <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
            )}
        </motion.div>
    );
}
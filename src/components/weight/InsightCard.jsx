import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function InsightCard({ message, type = "info" }) {
  const bgColors = {
    success: "bg-gradient-to-r from-emerald-500 to-teal-500",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500",
    info: "bg-gradient-to-r from-rose-400 to-pink-500",
    neutral: "bg-gradient-to-r from-gray-400 to-gray-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-4 ${bgColors[type]} text-white shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white/20 rounded-xl">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-1">Insight do dia</h4>
          <p className="text-sm text-white/90 leading-relaxed">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}
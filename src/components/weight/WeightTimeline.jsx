import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingDown, TrendingUp, Minus, Circle } from 'lucide-react';

export default function WeightTimeline({ entries, showDates = true, maxItems = 10 }) {
    if (!entries || entries.length === 0) {
        return null;
    }

    const sortedEntries = [...entries]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, maxItems);

    const getVariation = (current, previous) => {
        if (!previous) return null;
        return current.weight - previous.weight;
    };

    const formatDate = (dateStr) => {
        const date = parseISO(dateStr);
        if (isToday(date)) return 'Hoje';
        if (isYesterday(date)) return 'Ontem';
        return format(date, "d MMM", { locale: ptBR });
    };

    const getVariationColor = (variation) => {
        if (variation === null) return 'text-gray-400';
        if (variation < 0) return 'text-emerald-500';
        if (variation > 0) return 'text-rose-500';
        return 'text-gray-400';
    };

    const getVariationBg = (variation) => {
        if (variation === null) return 'bg-gray-100';
        if (variation < 0) return 'bg-emerald-50';
        if (variation > 0) return 'bg-rose-50';
        return 'bg-gray-50';
    };

    const getLineColor = (variation) => {
        if (variation === null) return 'bg-gray-200';
        if (variation < 0) return 'bg-emerald-300';
        if (variation > 0) return 'bg-rose-300';
        return 'bg-gray-200';
    };

    return (
        <div className="relative">
            {sortedEntries.map((entry, index) => {
                const previousEntry = sortedEntries[index + 1];
                const variation = getVariation(entry, previousEntry);
                const isFirst = index === 0;
                const isLast = index === sortedEntries.length - 1;

                return (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative flex items-start gap-4"
                    >
                        {/* Timeline line and dot */}
                        <div className="relative flex flex-col items-center">
                            {/* Dot */}
                            <div className={`relative z-10 w-4 h-4 rounded-full border-2 ${isFirst
                                    ? 'bg-gradient-to-br from-rose-400 to-pink-500 border-rose-300'
                                    : variation !== null && variation < 0
                                        ? 'bg-emerald-400 border-emerald-300'
                                        : variation !== null && variation > 0
                                            ? 'bg-rose-400 border-rose-300'
                                            : 'bg-gray-300 border-gray-200'
                                }`}>
                                {isFirst && (
                                    <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-30" />
                                )}
                            </div>

                            {/* Connecting line */}
                            {!isLast && (
                                <div className={`w-0.5 h-16 ${getLineColor(getVariation(sortedEntries[index + 1], sortedEntries[index + 2]))}`} />
                            )}
                        </div>

                        {/* Content */}
                        <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    {showDates && (
                                        <p className="text-xs text-gray-500 mb-1">{formatDate(entry.date)}</p>
                                    )}
                                    <p className="text-lg font-bold text-gray-900">{entry.weight.toFixed(2)} kg</p>
                                </div>

                                {variation !== null && (
                                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${getVariationBg(variation)}`}>
                                        {variation < 0 ? (
                                            <TrendingDown className={`w-4 h-4 ${getVariationColor(variation)}`} />
                                        ) : variation > 0 ? (
                                            <TrendingUp className={`w-4 h-4 ${getVariationColor(variation)}`} />
                                        ) : (
                                            <Minus className={`w-4 h-4 ${getVariationColor(variation)}`} />
                                        )}
                                        <span className={`text-sm font-semibold ${getVariationColor(variation)}`}>
                                            {variation > 0 ? '+' : ''}{(variation * 1000).toFixed(0)}g
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Mini progress bar for significant changes */}
                            {variation !== null && Math.abs(variation) > 0.1 && (
                                <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden w-32">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, Math.abs(variation) * 200)}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
                                        className={`h-full rounded-full ${variation < 0 ? 'bg-emerald-400' : 'bg-rose-400'
                                            }`}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
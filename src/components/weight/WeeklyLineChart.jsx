import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export default function WeeklyLineChart({ entries }) {
    if (!entries || entries.length === 0) {
        return null;
    }

    // Sort by date ascending for chart
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Prepare chart data
    const chartData = sortedEntries.map((entry, index) => {
        const prevEntry = sortedEntries[index - 1];
        const variation = prevEntry ? entry.weight - prevEntry.weight : 0;

        return {
            date: format(parseISO(entry.date), 'EEE', { locale: ptBR }),
            fullDate: format(parseISO(entry.date), "EEEE, d 'de' MMM", { locale: ptBR }),
            peso: entry.weight,
            variation: variation,
            variationGrams: variation * 1000
        };
    });

    const weights = sortedEntries.map(e => e.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;

    // Calculate total week change
    const weekStart = sortedEntries[0]?.weight;
    const weekEnd = sortedEntries[sortedEntries.length - 1]?.weight;
    const totalChange = weekEnd && weekStart ? weekEnd - weekStart : 0;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 min-w-[140px]">
                    <p className="text-xs text-gray-500 capitalize">{data.fullDate}</p>
                    <p className="text-lg font-bold text-gray-900">{data.peso.toFixed(2)} kg</p>
                    {data.variation !== 0 && (
                        <div className={`flex items-center gap-1 mt-1 text-sm ${data.variation < 0 ? 'text-emerald-600' : 'text-rose-500'
                            }`}>
                            {data.variation < 0 ? (
                                <TrendingDown className="w-3 h-3" />
                            ) : (
                                <TrendingUp className="w-3 h-3" />
                            )}
                            <span>{data.variation > 0 ? '+' : ''}{data.variationGrams.toFixed(0)}g</span>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variação da Semana
                </h3>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${totalChange < 0
                        ? 'bg-emerald-50 text-emerald-600'
                        : totalChange > 0
                            ? 'bg-rose-50 text-rose-500'
                            : 'bg-gray-50 text-gray-500'
                    }`}>
                    {totalChange < 0 ? (
                        <TrendingDown className="w-4 h-4" />
                    ) : totalChange > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                    ) : (
                        <Minus className="w-4 h-4" />
                    )}
                    {totalChange > 0 ? '+' : ''}{(totalChange * 1000).toFixed(0)}g
                </div>
            </div>

            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={totalChange <= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={totalChange <= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#9ca3af', textTransform: 'capitalize' }}
                            dy={10}
                        />
                        <YAxis
                            domain={[minWeight - 0.3, maxWeight + 0.3]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            tickFormatter={(value) => `${value.toFixed(1)}`}
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine
                            y={avgWeight}
                            stroke="#e5e7eb"
                            strokeDasharray="3 3"
                            label={{
                                value: 'Média',
                                position: 'right',
                                fill: '#9ca3af',
                                fontSize: 10
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="peso"
                            stroke={totalChange <= 0 ? "#10b981" : "#f43f5e"}
                            strokeWidth={3}
                            fill="url(#colorWeight)"
                            dot={{
                                r: 5,
                                fill: 'white',
                                stroke: totalChange <= 0 ? "#10b981" : "#f43f5e",
                                strokeWidth: 2
                            }}
                            activeDot={{
                                r: 7,
                                fill: totalChange <= 0 ? "#10b981" : "#f43f5e",
                                stroke: 'white',
                                strokeWidth: 2
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Daily variations below chart */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between gap-1">
                    {chartData.map((day, index) => (
                        <div key={index} className="flex-1 text-center">
                            <p className="text-[10px] text-gray-400 uppercase">{day.date}</p>
                            <p className="text-xs font-semibold text-gray-700">{day.peso.toFixed(1)}</p>
                            {index > 0 && (
                                <p className={`text-[10px] font-medium ${day.variation < 0 ? 'text-emerald-500' : day.variation > 0 ? 'text-rose-500' : 'text-gray-400'
                                    }`}>
                                    {day.variation !== 0 ? (day.variation > 0 ? '+' : '') + day.variationGrams.toFixed(0) + 'g' : '-'}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
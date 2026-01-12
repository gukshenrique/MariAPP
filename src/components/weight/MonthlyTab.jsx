import React from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, subMonths, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingDown, TrendingUp, Award, CalendarDays } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import WeightCard from './WeightCard.jsx';

export default function MonthlyTab({ entries, goal }) {
    const now = new Date();

    // Current month
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    // Last month
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const getMonthEntries = (start, end) => {
        return entries.filter(e => {
            const entryDate = parseISO(e.date);
            return isWithinInterval(entryDate, { start, end });
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const currentMonthEntries = getMonthEntries(currentMonthStart, currentMonthEnd);
    const lastMonthEntries = getMonthEntries(lastMonthStart, lastMonthEnd);

    const currentMonthLatest = [...currentMonthEntries].reverse()[0]?.weight;
    const currentMonthFirst = currentMonthEntries[0]?.weight;
    const lastMonthLatest = [...lastMonthEntries].reverse()[0]?.weight;

    // Month change
    const monthChange = currentMonthFirst && currentMonthLatest ? currentMonthLatest - currentMonthFirst : null;

    // vs Last month
    const vsLastMonth = currentMonthLatest && lastMonthLatest ? currentMonthLatest - lastMonthLatest : null;

    // Total accumulated
    const allSorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstEver = allSorted[0]?.weight;
    const latestEver = allSorted[allSorted.length - 1]?.weight;
    const totalLost = firstEver && latestEver ? firstEver - latestEver : 0;

    // Monthly goal progress
    const monthlyGoalProgress = goal?.monthly_goal && monthChange !== null
        ? Math.min(100, Math.abs(monthChange) / goal.monthly_goal * 100)
        : null;

    // Chart data - Monthly evolution (last 6 months)
    const getMonthlyChartData = () => {
        const monthsData = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = startOfMonth(subMonths(now, i));
            const monthEnd = endOfMonth(subMonths(now, i));
            const monthEntries = entries.filter(e => {
                const entryDate = parseISO(e.date);
                return isWithinInterval(entryDate, { start: monthStart, end: monthEnd });
            }).sort((a, b) => new Date(b.date) - new Date(a.date));

            if (monthEntries.length > 0) {
                const latestWeight = monthEntries[0]?.weight;
                monthsData.push({
                    month: format(monthStart, "MMM", { locale: ptBR }),
                    fullMonth: format(monthStart, "MMMM yyyy", { locale: ptBR }),
                    peso: latestWeight
                });
            }
        }
        return monthsData;
    };

    const chartData = getMonthlyChartData();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Resumo Mensal</h2>
                <p className="text-sm text-gray-500">{format(now, "MMMM 'de' yyyy", { locale: ptBR })}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <WeightCard
                    title="Peso Atual"
                    value={currentMonthLatest?.toFixed(1) || '--'}
                    unit="kg"
                    color="coral"
                />
                <WeightCard
                    title="Variação Mês"
                    value={monthChange !== null ? (monthChange > 0 ? '+' : '') + monthChange.toFixed(2) : '--'}
                    unit="kg"
                    change={monthChange}
                    color={monthChange !== null && monthChange <= 0 ? "green" : "purple"}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <WeightCard
                    title="vs Mês Passado"
                    value={vsLastMonth !== null ? (vsLastMonth > 0 ? '+' : '') + vsLastMonth.toFixed(2) : '--'}
                    unit="kg"
                    subtitle={lastMonthLatest ? `Mês passado: ${lastMonthLatest.toFixed(1)} kg` : ''}
                    color={vsLastMonth !== null && vsLastMonth <= 0 ? "green" : "blue"}
                />
                <WeightCard
                    title="Total Perdido"
                    value={totalLost > 0 ? totalLost.toFixed(1) : '--'}
                    unit="kg"
                    icon={Award}
                    color="green"
                />
            </div>

            {goal?.monthly_goal && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-5 border border-rose-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">🎯 Meta Mensal</span>
                        <span className="text-sm font-bold text-rose-600">
                            Perder {goal.monthly_goal.toFixed(1)} kg
                        </span>
                    </div>

                    {monthlyGoalProgress !== null && (
                        <>
                            <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(monthlyGoalProgress, 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full rounded-full ${monthlyGoalProgress >= 100
                                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                                        : 'bg-gradient-to-r from-rose-400 to-pink-500'
                                        }`}
                                />
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-600">
                                    {monthChange !== null && monthChange < 0
                                        ? `✅ ${Math.abs(monthChange).toFixed(2)} kg perdidos`
                                        : monthChange !== null && monthChange > 0
                                            ? `⚠️ +${monthChange.toFixed(2)} kg ganhos`
                                            : 'Registre pesos para acompanhar'}
                                </p>
                                <p className="text-xs font-semibold text-rose-600">
                                    {monthlyGoalProgress.toFixed(0)}%
                                </p>
                            </div>
                        </>
                    )}

                    <div className="mt-3 pt-3 border-t border-rose-100 grid grid-cols-2 gap-2">
                        {goal.weekly_goal && (
                            <div className="bg-white/50 rounded-xl p-2 text-center">
                                <p className="text-[10px] text-gray-500">Por semana</p>
                                <p className="text-sm font-semibold text-gray-700">{goal.weekly_goal.toFixed(2)} kg</p>
                            </div>
                        )}
                        {goal.daily_goal && (
                            <div className="bg-white/50 rounded-xl p-2 text-center">
                                <p className="text-[10px] text-gray-500">Por dia</p>
                                <p className="text-sm font-semibold text-gray-700">{goal.daily_goal.toFixed(0)}g</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {chartData.length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
                >
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Evolução Mensal</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af', textTransform: 'capitalize' }}
                                />
                                <YAxis
                                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    width={35}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                    }}
                                    formatter={(value) => [`${value.toFixed(2)} kg`, 'Peso']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="peso"
                                    stroke="#f43f5e"
                                    strokeWidth={2}
                                    fill="url(#colorPeso)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {chartData.length <= 1 && (
                <div className="text-center py-8 text-gray-400 bg-white rounded-3xl border border-gray-100">
                    <TrendingDown className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Registre mais pesos para ver o gráfico</p>
                </div>
            )}

            {/* Monthly History - Month to Month Comparisons */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Histórico Mensal
                </h3>
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
                    {(() => {
                        // Get data for last 6 months
                        const monthsData = [];
                        for (let i = 0; i < 6; i++) {
                            const monthStart = startOfMonth(subMonths(now, i));
                            const monthEnd = endOfMonth(subMonths(now, i));
                            const monthEntries = entries.filter(e => {
                                const entryDate = parseISO(e.date);
                                return isWithinInterval(entryDate, { start: monthStart, end: monthEnd });
                            }).sort((a, b) => new Date(b.date) - new Date(a.date));

                            if (monthEntries.length > 0) {
                                const latestWeight = monthEntries[0]?.weight;
                                monthsData.push({
                                    month: format(monthStart, "MMMM yyyy", { locale: ptBR }),
                                    shortMonth: format(monthStart, "MMM", { locale: ptBR }),
                                    weight: latestWeight,
                                    isCurrentMonth: i === 0
                                });
                            }
                        }

                        if (monthsData.length < 2) {
                            return (
                                <div className="text-center py-6 text-gray-400">
                                    <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p>Registre pesos por mais meses para ver o histórico</p>
                                </div>
                            );
                        }

                        return monthsData.map((month, index) => {
                            const prevMonth = monthsData[index + 1];
                            const variation = prevMonth ? month.weight - prevMonth.weight : null;

                            return (
                                <motion.div
                                    key={month.month}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-center justify-between p-3 rounded-2xl ${month.isCurrentMonth
                                        ? 'bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100'
                                        : 'bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${variation === null ? 'bg-gray-300' :
                                            variation < 0 ? 'bg-emerald-500' :
                                                variation > 0 ? 'bg-rose-500' : 'bg-gray-300'
                                            }`} />
                                        <div>
                                            <p className={`font-medium capitalize ${month.isCurrentMonth ? 'text-rose-600' : 'text-gray-700'}`}>
                                                {month.month}
                                            </p>
                                            <p className="text-lg font-bold text-gray-900">{month.weight.toFixed(1)} kg</p>
                                        </div>
                                    </div>

                                    {variation !== null && (
                                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${variation < 0 ? 'bg-emerald-50' :
                                            variation > 0 ? 'bg-rose-50' : 'bg-gray-100'
                                            }`}>
                                            {variation < 0 ? (
                                                <TrendingDown className="w-4 h-4 text-emerald-500" />
                                            ) : variation > 0 ? (
                                                <TrendingUp className="w-4 h-4 text-rose-500" />
                                            ) : null}
                                            <span className={`text-sm font-semibold ${variation < 0 ? 'text-emerald-600' :
                                                variation > 0 ? 'text-rose-500' : 'text-gray-500'
                                                }`}>
                                                {variation > 0 ? '+' : ''}{variation.toFixed(1)} kg
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        });
                    })()}
                </div>
            </div>
        </div>
    );
}
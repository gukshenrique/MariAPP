import React from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, subWeeks, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingDown, Calendar } from 'lucide-react';
import WeightCard from './WeightCard.jsx';
import WeeklyLineChart from './WeeklyLineChart.jsx';

export default function WeeklyTab({ entries, goal }) {
    const now = new Date();

    // Current week
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Last week
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const getWeekEntries = (start, end) => {
        return entries.filter(e => {
            const entryDate = parseISO(e.date);
            return isWithinInterval(entryDate, { start, end });
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const currentWeekEntries = getWeekEntries(currentWeekStart, currentWeekEnd);
    const lastWeekEntries = getWeekEntries(lastWeekStart, lastWeekEnd);

    const currentWeekLatest = currentWeekEntries[0]?.weight;
    const currentWeekFirst = currentWeekEntries[currentWeekEntries.length - 1]?.weight;
    const lastWeekLatest = lastWeekEntries[0]?.weight;

    // Week change (first entry of week vs last entry of week)
    const weekChange = currentWeekFirst && currentWeekLatest ? currentWeekLatest - currentWeekFirst : null;

    // vs Last week (compare latest of each week)
    const vsLastWeek = currentWeekLatest && lastWeekLatest ? currentWeekLatest - lastWeekLatest : null;

    // Total accumulated
    const allSorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstEver = allSorted[0]?.weight;
    const latestEver = allSorted[allSorted.length - 1]?.weight;
    const totalLost = firstEver && latestEver ? firstEver - latestEver : 0;

    // Weekly goal progress
    const weeklyGoalProgress = goal?.weekly_goal && weekChange !== null
        ? Math.min(100, Math.abs(weekChange) / goal.weekly_goal * 100)
        : null;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Resumo Semanal</h2>
                <p className="text-sm text-gray-500">
                    {format(currentWeekStart, "d 'de' MMM", { locale: ptBR })} - {format(currentWeekEnd, "d 'de' MMM", { locale: ptBR })}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <WeightCard
                    title="Peso Atual"
                    value={currentWeekLatest?.toFixed(1) || '--'}
                    unit="kg"
                    color="coral"
                />
                <WeightCard
                    title="Variação Semana"
                    value={weekChange !== null ? (weekChange * 1000).toFixed(0) : '--'}
                    unit="g"
                    change={weekChange}
                    color={weekChange !== null && weekChange <= 0 ? "green" : "purple"}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <WeightCard
                    title="vs Semana Passada"
                    value={vsLastWeek !== null ? (vsLastWeek > 0 ? '+' : '') + vsLastWeek.toFixed(2) : '--'}
                    unit="kg"
                    subtitle={lastWeekLatest ? `Sem. passada: ${lastWeekLatest.toFixed(1)} kg` : ''}
                    color={vsLastWeek !== null && vsLastWeek <= 0 ? "green" : "blue"}
                />
                <WeightCard
                    title="Acumulado"
                    value={totalLost > 0 ? totalLost.toFixed(1) : '--'}
                    unit="kg perdidos"
                    color="green"
                />
            </div>

            {goal?.weekly_goal && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-5 border border-blue-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">🎯 Meta Semanal</span>
                        <span className="text-sm font-bold text-blue-600">
                            Perder {goal.weekly_goal.toFixed(2)} kg ({(goal.weekly_goal * 1000).toFixed(0)}g)
                        </span>
                    </div>

                    {weeklyGoalProgress !== null && (
                        <>
                            <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(weeklyGoalProgress, 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full rounded-full ${weeklyGoalProgress >= 100
                                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                                        : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                                        }`}
                                />
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-600">
                                    {weekChange !== null && weekChange < 0
                                        ? `✅ ${Math.abs(weekChange).toFixed(2)} kg perdidos`
                                        : weekChange !== null && weekChange > 0
                                            ? `⚠️ +${weekChange.toFixed(2)} kg ganhos`
                                            : 'Registre pesos para acompanhar'}
                                </p>
                                <p className="text-xs font-semibold text-blue-600">
                                    {weeklyGoalProgress.toFixed(0)}%
                                </p>
                            </div>
                        </>
                    )}

                    {goal.daily_goal && (
                        <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-blue-100">
                            💡 Isso equivale a ~{goal.daily_goal.toFixed(0)}g por dia
                        </p>
                    )}
                </motion.div>
            )}

            {/* Weekly Line Chart */}
            {currentWeekEntries.length > 1 ? (
                <WeeklyLineChart entries={currentWeekEntries} />
            ) : (
                <div className="text-center py-8 text-gray-400 bg-white rounded-3xl border border-gray-100">
                    <TrendingDown className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>{currentWeekEntries.length === 1 ? 'Registre mais pesos para ver o gráfico' : 'Nenhum registro esta semana'}</p>
                </div>
            )}
        </div>
    );
}
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Scale, Trash2, Target, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parseISO, isToday, isYesterday, subDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import WeightCard from './WeightCard.jsx';
import InsightCard from './InsightCard.jsx';
import WeightTimeline from './WeightTimeline.jsx';

export default function DailyTab({ entries, goal, onAddEntry, onDeleteEntry, isLoading }) {
    const [weight, setWeight] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [showForm, setShowForm] = useState(false);

    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const todayEntry = sortedEntries.find(e => isToday(parseISO(e.date)));
    const yesterdayEntry = sortedEntries.find(e => isYesterday(parseISO(e.date)));

    const currentWeight = todayEntry?.weight || sortedEntries[0]?.weight;
    const previousWeight = yesterdayEntry?.weight || sortedEntries[1]?.weight;
    const weightChange = currentWeight && previousWeight ? currentWeight - previousWeight : null;

    // Calculate total lost
    const firstEntry = sortedEntries[sortedEntries.length - 1];
    const totalLost = firstEntry && currentWeight ? firstEntry.weight - currentWeight : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!weight) return;

        await onAddEntry({ weight: parseFloat(weight), date });
        setWeight('');
        setShowForm(false);
    };

    const getInsight = () => {
        if (!todayEntry) {
            return { message: "Registre seu peso de hoje para acompanhar seu progresso! 💪", type: "info" };
        }
        if (weightChange === null) {
            return { message: "Continue registrando diariamente para ver insights personalizados!", type: "neutral" };
        }
        if (weightChange < -0.3) {
            return { message: `Incrível! Você perdeu ${Math.abs(weightChange * 1000).toFixed(0)}g desde ontem. Seu esforço está valendo a pena! 🎉`, type: "success" };
        }
        if (weightChange < 0) {
            return { message: `Ótimo progresso! Menos ${Math.abs(weightChange * 1000).toFixed(0)}g. Mantenha o foco! ✨`, type: "success" };
        }
        if (weightChange === 0) {
            return { message: "Peso estável hoje. Isso é normal! Continue com seus hábitos saudáveis. 🌟", type: "neutral" };
        }
        if (weightChange <= 0.3) {
            return { message: "Pequena variação de peso é normal. Pode ser retenção de líquidos. Continue firme! 💧", type: "warning" };
        }
        return { message: "O peso pode variar naturalmente. Foque no progresso a longo prazo! 🎯", type: "warning" };
    };

    const insight = getInsight();

    // Calculate goals dynamically if not saved
    const calculatedGoals = (() => {
        if (!goal || !goal.target_weight || !goal.target_date || !currentWeight) {
            return null;
        }

        const target = goal.target_weight;
        const weightToLose = currentWeight - target;

        if (weightToLose <= 0) return null;

        const daysRemaining = differenceInDays(parseISO(goal.target_date), new Date());
        if (daysRemaining <= 0) return null;

        const weeksRemaining = daysRemaining / 7;
        const monthsRemaining = daysRemaining / 30;

        return {
            total: weightToLose,
            daily: goal.daily_goal || (weightToLose / daysRemaining) * 1000,
            weekly: goal.weekly_goal || weightToLose / weeksRemaining,
            monthly: goal.monthly_goal || weightToLose / monthsRemaining,
            daysRemaining,
        };
    })();

    // Get last 7 days entries for daily variations
    const last7DaysEntries = sortedEntries.slice(0, 7);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hoje</h2>
                    <p className="text-sm text-gray-500">{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-full w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4"
                    >
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Peso (kg)</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="Ex: 72.5"
                                className="mt-2 rounded-xl border-gray-200 text-lg h-12"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Data</label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="mt-2 rounded-xl border-gray-200 h-12"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full rounded-xl h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600"
                        >
                            Registrar Peso
                        </Button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-4">
                <WeightCard
                    title="Peso Atual"
                    value={currentWeight?.toFixed(1) || '--'}
                    unit="kg"
                    icon={Scale}
                    color="coral"
                />
                <WeightCard
                    title="vs Ontem"
                    value={weightChange !== null ? (weightChange > 0 ? '+' : '') + (weightChange * 1000).toFixed(0) : '--'}
                    unit="g"
                    subtitle={previousWeight ? `Ontem: ${previousWeight.toFixed(1)} kg` : ''}
                    color={weightChange !== null && weightChange <= 0 ? "green" : "purple"}
                />
            </div>

            {/* Metas Calculadas - Second topic */}
            {calculatedGoals && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                            Metas Calculadas
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/50 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-gray-500 uppercase">Total a perder</p>
                            <p className="text-lg font-bold text-gray-900">
                                {calculatedGoals.total.toFixed(1)} kg
                            </p>
                        </div>
                        <div className="bg-white/50 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-gray-500 uppercase">Dias restantes</p>
                            <p className="text-lg font-bold text-gray-900">
                                {calculatedGoals.daysRemaining}
                            </p>
                        </div>
                        <div className="bg-white/50 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-gray-500 uppercase">Por dia</p>
                            <p className="text-lg font-bold text-emerald-600">{calculatedGoals.daily.toFixed(0)}g</p>
                        </div>
                        <div className="bg-white/50 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-gray-500 uppercase">Por semana</p>
                            <p className="text-lg font-bold text-emerald-600">{calculatedGoals.weekly.toFixed(2)} kg</p>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 text-center">
                        Meta mensal: ~{calculatedGoals.monthly.toFixed(1)} kg
                    </p>
                </motion.div>
            )}

            {totalLost > 0 && (
                <WeightCard
                    title="Total Perdido"
                    value={totalLost.toFixed(1)}
                    unit="kg"
                    subtitle={`Desde ${format(parseISO(firstEntry.date), "d 'de' MMM", { locale: ptBR })}`}
                    color="green"
                />
            )}

            <InsightCard message={insight.message} type={insight.type} />

            {/* Daily Evolution Chart with Goal Line */}
            {last7DaysEntries.length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Evolução Diária
                        </h3>
                        {goal?.daily_goal && (
                            <div className="flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-0.5 bg-rose-400 rounded" />
                                    <span className="text-gray-500">Peso</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-0.5 bg-emerald-400 rounded" style={{ borderStyle: 'dashed', borderWidth: '1px', backgroundColor: 'transparent', borderColor: '#10b981' }} />
                                    <span className="text-gray-500">Meta</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {(() => {
                        // Prepare chart data with goal tracking
                        const chartEntries = [...last7DaysEntries].reverse();
                        const firstWeight = chartEntries[0]?.weight;
                        const dailyGoalGrams = goal?.daily_goal || 0;

                        const chartData = chartEntries.map((entry, index) => {
                            // Expected weight if goal was met each day
                            const expectedWeight = firstWeight - ((dailyGoalGrams / 1000) * index);
                            const actualWeight = entry.weight;
                            const metGoal = actualWeight <= expectedWeight;

                            return {
                                date: format(parseISO(entry.date), 'EEE', { locale: ptBR }),
                                fullDate: format(parseISO(entry.date), "d 'de' MMM", { locale: ptBR }),
                                peso: actualWeight,
                                meta: dailyGoalGrams > 0 ? expectedWeight : null,
                                metGoal
                            };
                        });

                        const weights = chartData.map(d => d.peso);
                        const minWeight = Math.min(...weights) - 0.3;
                        const maxWeight = Math.max(...weights) + 0.3;

                        return (
                            <>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorPesoDaily" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#9ca3af', textTransform: 'capitalize' }}
                                            />
                                            <YAxis
                                                domain={[minWeight, maxWeight]}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                                width={35}
                                                tickFormatter={(v) => v.toFixed(1)}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                                }}
                                                formatter={(value, name) => [
                                                    `${value.toFixed(2)} kg`,
                                                    name === 'peso' ? 'Peso Real' : 'Meta Esperada'
                                                ]}
                                                labelFormatter={(label) => {
                                                    const item = chartData.find(d => d.date === label);
                                                    return item?.fullDate || label;
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="peso"
                                                stroke="#f43f5e"
                                                strokeWidth={2}
                                                fill="url(#colorPesoDaily)"
                                                dot={{ r: 4, fill: 'white', stroke: '#f43f5e', strokeWidth: 2 }}
                                            />
                                            {goal?.daily_goal && (
                                                <Area
                                                    type="monotone"
                                                    dataKey="meta"
                                                    stroke="#10b981"
                                                    strokeWidth={2}
                                                    strokeDasharray="5 5"
                                                    fill="transparent"
                                                    dot={{ r: 3, fill: '#10b981', stroke: '#10b981' }}
                                                />
                                            )}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Goal tracking summary */}
                                {goal?.daily_goal && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex justify-between gap-2">
                                            {chartData.slice(1).map((day, index) => {
                                                const prevDay = chartData[index];
                                                const dailyLoss = prevDay.peso - day.peso;
                                                const metDailyGoal = dailyLoss >= (dailyGoalGrams / 1000);

                                                return (
                                                    <div key={index} className="flex-1 text-center">
                                                        <p className="text-[10px] text-gray-400 uppercase capitalize">{day.date}</p>
                                                        <div className={`flex items-center justify-center mt-1 ${metDailyGoal ? 'text-emerald-500' : 'text-rose-400'
                                                            }`}>
                                                            {metDailyGoal ? (
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <p className={`text-[10px] font-medium ${dailyLoss > 0 ? 'text-emerald-500' : 'text-rose-400'
                                                            }`}>
                                                            {dailyLoss > 0 ? '-' : '+'}{Math.abs(dailyLoss * 1000).toFixed(0)}g
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </motion.div>
            )}

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Todos os Registros</h3>
                    <span className="text-xs text-gray-400">{sortedEntries.length} registros</span>
                </div>

                {sortedEntries.length > 0 ? (
                    <div className="space-y-2">
                        {sortedEntries.map((entry, index) => {
                            const prevEntry = sortedEntries[index + 1];
                            const variation = prevEntry ? entry.weight - prevEntry.weight : null;

                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${variation === null ? 'bg-gray-300' :
                                            variation < 0 ? 'bg-emerald-500' :
                                                variation > 0 ? 'bg-rose-500' : 'bg-gray-300'
                                            }`} />
                                        <div>
                                            <p className="font-semibold text-gray-900">{entry.weight.toFixed(2)} kg</p>
                                            <p className="text-xs text-gray-500">
                                                {isToday(parseISO(entry.date)) ? 'Hoje' :
                                                    isYesterday(parseISO(entry.date)) ? 'Ontem' :
                                                        format(parseISO(entry.date), "d 'de' MMM, yyyy", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {variation !== null && (
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${variation < 0 ? 'bg-emerald-50 text-emerald-600' :
                                                variation > 0 ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-500'
                                                }`}>
                                                {variation > 0 ? '+' : ''}{(variation * 1000).toFixed(0)}g
                                            </span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDeleteEntry(entry.id)}
                                            className="text-gray-400 hover:text-rose-500 rounded-full h-8 w-8"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhum registro ainda</p>
                        <p className="text-sm">Toque no + para adicionar seu peso</p>
                    </div>
                )}
            </div>
        </div>
    );
}
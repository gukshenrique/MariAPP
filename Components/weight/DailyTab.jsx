import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Scale, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parseISO, isToday, isYesterday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WeightCard from './WeightCard.jsx';
import InsightCard from './InsightCard';
import WeeklyLineChart from './WeeklyLineChart';

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

    // Get current week entries for chart
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const currentWeekEntries = entries.filter(e => {
        const entryDate = parseISO(e.date);
        return isWithinInterval(entryDate, { start: currentWeekStart, end: currentWeekEnd });
    });

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

            {goal?.daily_goal && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 uppercase">🎯 Meta Diária</span>
                        <span className="text-lg font-bold text-emerald-600">
                            Perder {goal.daily_goal.toFixed(0)}g
                        </span>
                    </div>
                </div>
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

            {/* Weekly Line Chart */}
            {currentWeekEntries.length > 1 && (
                <WeeklyLineChart entries={currentWeekEntries} />
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
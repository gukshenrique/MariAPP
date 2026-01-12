import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Trash2, Save, Calculator } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SettingsTab({ goal, entries, onSaveGoal, onDeleteGoal }) {
    const [targetWeight, setTargetWeight] = useState(goal?.target_weight || '');
    const [targetDate, setTargetDate] = useState(goal?.target_date || '');
    const [isSaving, setIsSaving] = useState(false);

    // Get current weight from most recent entry
    const sortedEntries = [...(entries || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    const currentWeight = sortedEntries[0]?.weight;

    // Calculate goals based on target
    const calculateGoals = () => {
        if (!targetWeight || !targetDate || !currentWeight) return null;

        const target = parseFloat(targetWeight);
        const weightToLose = currentWeight - target;

        if (weightToLose <= 0) return null;

        const daysRemaining = differenceInDays(parseISO(targetDate), new Date());
        if (daysRemaining <= 0) return null;

        const weeksRemaining = daysRemaining / 7;
        const monthsRemaining = daysRemaining / 30;

        return {
            total: weightToLose,
            daily: (weightToLose / daysRemaining) * 1000, // in grams
            weekly: weightToLose / weeksRemaining,
            monthly: weightToLose / monthsRemaining,
            daysRemaining,
        };
    };

    const calculatedGoals = calculateGoals();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!targetWeight) return;

        setIsSaving(true);
        try {
            await onSaveGoal({
                target_weight: parseFloat(targetWeight),
                target_date: targetDate || null,
                initial_weight: currentWeight || null,
                daily_goal: calculatedGoals?.daily || null,
                weekly_goal: calculatedGoals?.weekly || null,
                monthly_goal: calculatedGoals?.monthly || null,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (goal?.id && window.confirm('Tem certeza que deseja deletar sua meta?')) {
            await onDeleteGoal(goal.id);
            setTargetWeight('');
            setTargetDate('');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
                <p className="text-sm text-gray-500">Defina suas metas de peso</p>
            </div>

            {/* Current Status */}
            {currentWeight && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-5 border border-rose-100"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Peso Atual</p>
                            <p className="text-2xl font-bold text-gray-900">{currentWeight.toFixed(1)} kg</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Goal Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-5"
            >
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Definir Meta
                </h3>

                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Peso Alvo (kg)
                    </label>
                    <Input
                        type="number"
                        step="0.1"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value)}
                        placeholder="Ex: 65.0"
                        className="mt-2 rounded-xl border-gray-200 text-lg h-12"
                        required
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Limite (opcional)
                    </label>
                    <Input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="mt-2 rounded-xl border-gray-200 h-12"
                    />
                </div>

                <div className="flex gap-3">
                    <Button
                        type="submit"
                        disabled={isSaving || !targetWeight}
                        className="flex-1 rounded-xl h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {goal?.id ? 'Atualizar Meta' : 'Salvar Meta'}
                    </Button>

                    {goal?.id && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDelete}
                            className="rounded-xl h-12 border-rose-200 text-rose-500 hover:bg-rose-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </motion.form>

            {/* Current Goal Display */}
            {goal && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-5 border border-emerald-100"
                >
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">🎯 Meta Atual</h3>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Peso alvo</span>
                            <span className="font-bold text-gray-900">{goal.target_weight} kg</span>
                        </div>

                        {goal.target_date && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Data limite</span>
                                <span className="font-medium text-gray-900">
                                    {format(parseISO(goal.target_date), "d 'de' MMMM, yyyy", { locale: ptBR })}
                                </span>
                            </div>
                        )}

                        {goal.initial_weight && currentWeight && (
                            <div className="pt-3 border-t border-emerald-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Progresso</span>
                                    <span className="font-bold text-emerald-600">
                                        {(goal.initial_weight - currentWeight).toFixed(1)} kg perdidos
                                    </span>
                                </div>
                                <div className="mt-2 h-2 bg-white/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(100, ((goal.initial_weight - currentWeight) / (goal.initial_weight - goal.target_weight)) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Data info */}
            <div className="text-center py-4 text-xs text-gray-400">
                <p>💾 Seus dados são salvos localmente no navegador</p>
            </div>
        </div>
    );
}

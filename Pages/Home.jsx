import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import BottomNav from '@/components/weight/BottomNav';
import DailyTab from '@/components/weight/DailyTab';
import WeeklyTab from '@/components/weight/WeeklyTab';
import MonthlyTab from '@/components/weight/MonthlyTab';
import SettingsTab from '@/components/weight/SettingsTab';

export default function Home() {
    const [activeTab, setActiveTab] = useState('daily');
    const queryClient = useQueryClient();

    // Fetch weight entries
    const { data: entries = [], isLoading: loadingEntries } = useQuery({
        queryKey: ['weightEntries'],
        queryFn: () => base44.entities.WeightEntry.list('-date', 100),
    });

    // Fetch goals
    const { data: goals = [], isLoading: loadingGoals } = useQuery({
        queryKey: ['weightGoals'],
        queryFn: () => base44.entities.WeightGoal.list('-created_date', 1),
    });

    const goal = goals[0];

    // Mutations
    const addEntryMutation = useMutation({
        mutationFn: (data) => base44.entities.WeightEntry.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weightEntries'] }),
    });

    const deleteEntryMutation = useMutation({
        mutationFn: (id) => base44.entities.WeightEntry.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weightEntries'] }),
        onError: () => queryClient.invalidateQueries({ queryKey: ['weightEntries'] }),
    });

    const saveGoalMutation = useMutation({
        mutationFn: (data) => {
            if (goal?.id) {
                return base44.entities.WeightGoal.update(goal.id, data);
            }
            return base44.entities.WeightGoal.create(data);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weightGoals'] }),
    });

    const deleteGoalMutation = useMutation({
        mutationFn: (id) => base44.entities.WeightGoal.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weightGoals'] }),
    });

    const isLoading = loadingEntries || loadingGoals;

    const renderContent = () => {
        switch (activeTab) {
            case 'daily':
                return (
                    <DailyTab
                        entries={entries}
                        goal={goal}
                        onAddEntry={addEntryMutation.mutateAsync}
                        onDeleteEntry={deleteEntryMutation.mutateAsync}
                        isLoading={addEntryMutation.isPending}
                    />
                );
            case 'weekly':
                return <WeeklyTab entries={entries} goal={goal} />;
            case 'monthly':
                return <MonthlyTab entries={entries} goal={goal} />;
            case 'settings':
                return (
                    <SettingsTab
                        goal={goal}
                        entries={entries}
                        onSaveGoal={saveGoalMutation.mutateAsync}
                        onDeleteGoal={deleteGoalMutation.mutateAsync}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-5 py-4">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200">
                        <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">MariAPP</h1>
                        <p className="text-xs text-gray-500">Seu progresso, sua jornada</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-lg mx-auto px-5 py-6 pb-24">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            {/* Bottom Navigation */}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}
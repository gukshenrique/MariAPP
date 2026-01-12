import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, User, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (!username || username.trim().length < 2) {
            setError('Por favor, digite um nome válido.');
            return;
        }

        const result = login(username);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-white flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="rounded-3xl shadow-xl shadow-rose-100/50 border-white/50 bg-white/80 backdrop-blur">
                    <CardHeader className="text-center space-y-4 pb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-200 mx-auto transform rotate-3">
                            <Heart className="w-8 h-8 text-white fill-current" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                Olá! Quem é você?
                            </CardTitle>
                            <CardDescription className="text-base text-gray-500">
                                Digite seu nome para acessar ou criar sua conta automaticamente.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-gray-700 font-medium ml-1">
                                    Seu Nome
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="username"
                                        placeholder="Ex: Maria"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="h-14 pl-12 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white text-lg transition-all focus:ring-2 focus:ring-rose-500/20"
                                        autoComplete="username"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-sm text-rose-500 text-center font-medium bg-rose-50 p-2 rounded-lg border border-rose-100"
                                >
                                    {error}
                                </motion.p>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-200 transition-all active:scale-[0.98]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Entrando...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Acessar MariAPP
                                        <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        <p className="text-xs text-center text-gray-400">
                            🔒 Seus dados ficam salvos neste navegador e dispositivo.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, LogIn, UserPlus, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let result;
            if (isLogin) {
                result = login(username, password);
            } else {
                result = register(username, name, password);
            }

            if (!result.success) {
                setError(result.error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setUsername('');
        setName('');
        setPassword('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-white flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-xl shadow-rose-200 mx-auto mb-4">
                    <Heart className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">MariAPP</h1>
                <p className="text-gray-500 mt-1">Seu progresso, sua jornada</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-sm"
            >
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-rose-100/50 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                        {isLogin ? 'Entrar' : 'Criar Conta'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuário
                            </label>
                            <div className="relative mt-2">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="seu_usuario"
                                    className="pl-10 rounded-xl border-gray-200 h-12"
                                    required
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Seu Nome
                                </label>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Maria"
                                    className="mt-2 rounded-xl border-gray-200 h-12"
                                />
                            </motion.div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Senha
                            </label>
                            <div className="relative mt-2">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••"
                                    className="pl-10 rounded-xl border-gray-200 h-12"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-rose-500 text-center bg-rose-50 rounded-xl p-3"
                            >
                                {error}
                            </motion.p>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl h-12 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 mt-2"
                        >
                            {isLogin ? (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Entrar
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Criar Conta
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={toggleMode}
                            className="text-sm text-gray-500 hover:text-rose-500 transition-colors"
                        >
                            {isLogin ? (
                                <>Não tem conta? <span className="font-semibold text-rose-500">Criar agora</span></>
                            ) : (
                                <>Já tem conta? <span className="font-semibold text-rose-500">Entrar</span></>
                            )}
                        </button>
                    </div>
                </div>

                <p className="text-xs text-gray-400 text-center mt-6">
                    💾 Seus dados ficam salvos localmente no navegador
                </p>
            </motion.div>
        </div>
    );
}

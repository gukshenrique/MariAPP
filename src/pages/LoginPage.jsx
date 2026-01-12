import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, User, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, register } = useAuth();

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await login(username, password);

        if (!result.success) {
            setError(result.error);
        }
        setIsSubmitting(false);
    };

    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não conferem');
            return;
        }

        setIsSubmitting(true);
        const result = await register(username, password);

        if (!result.success) {
            setError(result.error);
        }
        setIsSubmitting(false);
    };

    const clearForm = () => {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-white flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="rounded-3xl shadow-xl shadow-rose-100/50 border-white/50 bg-white/80 backdrop-blur">
                    <CardHeader className="text-center space-y-4 pb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-200 mx-auto transform rotate-3">
                            <Heart className="w-8 h-8 text-white fill-current" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                MariAPP
                            </CardTitle>
                            <CardDescription className="text-base text-gray-500">
                                Seu progresso, sua jornada
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Tabs defaultValue="login" className="w-full" onValueChange={clearForm}>
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="login">Entrar</TabsTrigger>
                                <TabsTrigger value="register">Criar Conta</TabsTrigger>
                            </TabsList>

                            {/* Tab de Login */}
                            <TabsContent value="login">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-user" className="text-gray-700">Usuário</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                id="login-user"
                                                placeholder="Seu nome de usuário"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="h-12 pl-10 rounded-xl"
                                                autoComplete="username"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="login-pass" className="text-gray-700">Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                id="login-pass"
                                                type="password"
                                                placeholder="Sua senha"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="h-12 pl-10 rounded-xl"
                                                autoComplete="current-password"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-lg"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Entrando...' : (
                                            <span className="flex items-center gap-2">
                                                Entrar <ArrowRight className="w-5 h-5" />
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* Tab de Registro */}
                            <TabsContent value="register">
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-user" className="text-gray-700">Escolha um nome de usuário</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                id="reg-user"
                                                placeholder="Ex: maria"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="h-12 pl-10 rounded-xl"
                                                autoComplete="username"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-pass" className="text-gray-700">Crie uma senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                id="reg-pass"
                                                type="password"
                                                placeholder="Mínimo 4 caracteres"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="h-12 pl-10 rounded-xl"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-confirm" className="text-gray-700">Confirme a senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                id="reg-confirm"
                                                type="password"
                                                placeholder="Digite novamente"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="h-12 pl-10 rounded-xl"
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-lg"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Criando...' : (
                                            <span className="flex items-center gap-2">
                                                <UserPlus className="w-5 h-5" /> Criar Conta
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>

                        <p className="text-xs text-center text-gray-400 pt-2">
                            🔐 Seus dados são salvos com segurança no servidor
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

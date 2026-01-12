import React, { createContext, useContext, useState, useEffect } from 'react';
import base44 from '../api/base44Client';

const AuthContext = createContext(null);

// Em produção, frontend e backend estão no mesmo servidor
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
const CURRENT_USER_KEY = 'mariapp_current_user';

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load: check for active session
    useEffect(() => {
        const savedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (savedUser) {
            const user = JSON.parse(savedUser);
            setCurrentUser(user);
            base44.setCurrentUser(user);
        }
        setIsLoading(false);
    }, []);

    // Login: Verifica credenciais no backend
    const login = async (username, password) => {
        if (!username || username.trim().length < 2) {
            return { success: false, error: 'Digite um nome válido' };
        }
        if (!password || password.length < 4) {
            return { success: false, error: 'Digite uma senha válida' };
        }

        try {
            const response = await fetch(`${API_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Erro ao fazer login' };
            }

            const user = data.user;
            setCurrentUser(user);
            base44.setCurrentUser(user);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

            return { success: true, user };
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: 'Erro de conexão com o servidor' };
        }
    };

    // Register: Cria novo usuário no backend
    const register = async (username, password) => {
        if (!username || username.trim().length < 2) {
            return { success: false, error: 'Nome deve ter pelo menos 2 caracteres' };
        }
        if (!password || password.length < 4) {
            return { success: false, error: 'Senha deve ter pelo menos 4 caracteres' };
        }

        try {
            const response = await fetch(`${API_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Erro ao criar conta' };
            }

            const user = data.user;
            setCurrentUser(user);
            base44.setCurrentUser(user);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

            return { success: true, user };
        } catch (error) {
            console.error('Erro no registro:', error);
            return { success: false, error: 'Erro de conexão com o servidor' };
        }
    };

    const logout = () => {
        setCurrentUser(null);
        base44.setCurrentUser(null);
        localStorage.removeItem(CURRENT_USER_KEY);
    };

    const value = {
        currentUser,
        isLoading,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

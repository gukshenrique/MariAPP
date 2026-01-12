import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'mariapp_users';
const CURRENT_USER_KEY = 'mariapp_current_user';

// Get all registered users
function getUsers() {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : {};
}

// Save users
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    // Login function
    const login = (username, password) => {
        const users = getUsers();
        const user = users[username.toLowerCase()];

        if (!user) {
            return { success: false, error: 'Usuário não encontrado' };
        }

        if (user.password !== password) {
            return { success: false, error: 'Senha incorreta' };
        }

        const userData = { username: user.username, name: user.name };
        setCurrentUser(userData);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
        return { success: true };
    };

    // Register function
    const register = (username, name, password) => {
        if (!username || !password) {
            return { success: false, error: 'Preencha todos os campos' };
        }

        if (username.length < 3) {
            return { success: false, error: 'Username deve ter pelo menos 3 caracteres' };
        }

        if (password.length < 4) {
            return { success: false, error: 'Senha deve ter pelo menos 4 caracteres' };
        }

        const users = getUsers();
        const key = username.toLowerCase();

        if (users[key]) {
            return { success: false, error: 'Usuário já existe' };
        }

        users[key] = {
            username: key,
            name: name || username,
            password,
            createdAt: new Date().toISOString()
        };

        saveUsers(users);

        const userData = { username: key, name: name || username };
        setCurrentUser(userData);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
        return { success: true };
    };

    // Logout function
    const logout = () => {
        setCurrentUser(null);
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

// Helper to get user-specific storage key
export function getUserStorageKey(baseKey, username) {
    return `mariapp_user_${username}_${baseKey}`;
}

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'mariapp_users';
const CURRENT_USER_KEY = 'mariapp_current_user';

// Get all registered users from localStorage with legacy support
function getUsers() {
    try {
        const data = localStorage.getItem(USERS_KEY);
        if (!data) return [];

        const parsed = JSON.parse(data);

        // Se já for array (formato novo), retorna
        if (Array.isArray(parsed)) return parsed;

        // Se for objeto (formato legado), migra para array
        if (typeof parsed === 'object' && parsed !== null) {
            console.warn('Migrating legacy user data to array format');
            const usersArray = Object.values(parsed);
            saveUsers(usersArray); // Salva já corrigido
            return usersArray;
        }

        return [];
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load: check for active session
    useEffect(() => {
        const savedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    // Simplified Login: Just needs username
    // If username exists -> Login
    // If username new -> Register then Login
    const login = (usernameInput) => {
        if (!usernameInput || usernameInput.trim().length < 2) {
            return { success: false, error: 'Digite um nome válido (mínimo 2 letras)' };
        }

        const username = usernameInput.trim();
        const users = getUsers();

        // Check if user already exists (case insensitive)
        const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        let userToLogin;

        if (existingUser) {
            // User Exists - Load them
            userToLogin = existingUser;
        } else {
            // User New - Create them
            userToLogin = {
                id: Date.now().toString(),
                username: username,
                name: username, // For now name = username
                createdAt: new Date().toISOString()
            };

            const updatedUsers = [...users, userToLogin];
            saveUsers(updatedUsers);
        }

        // Set Session
        setCurrentUser(userToLogin);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToLogin));

        return { success: true, user: userToLogin, isNew: !existingUser };
    };

    // Keep register for compatibility but it just redirects to login logic
    const register = (username) => {
        return login(username);
    };

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

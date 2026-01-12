import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { setCurrentUser } from './api/base44Client';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
        },
    },
});

function AppContent() {
    const { currentUser, isAuthenticated, isLoading } = useAuth();
    const [isUserSynced, setIsUserSynced] = useState(false);

    // Sync current user to API client BEFORE rendering Home
    useEffect(() => {
        if (isLoading) {
            // Still loading auth state
            setIsUserSynced(false);
            return;
        }

        if (currentUser) {
            setCurrentUser(currentUser); // Passa o objeto completo com id, username, etc
            // Clear old queries and mark as synced
            queryClient.clear();
            setIsUserSynced(true);
        } else {
            setCurrentUser(null);
            setIsUserSynced(true);
        }
    }, [currentUser, isLoading]);

    // Show loading while auth is loading OR while syncing user to API client
    if (isLoading || (isAuthenticated && !isUserSynced)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-white flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return <Home />;
}

export default function App() {
    return (
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <AppContent />
            </QueryClientProvider>
        </AuthProvider>
    );
}

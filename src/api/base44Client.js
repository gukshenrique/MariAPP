// API Client para MariAPP - Conecta ao backend SQLite
// Substitui a versão antiga que usava localStorage

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let currentUser = null;

// Set the current user for data operations
export function setCurrentUser(user) {
    currentUser = user;
}

// Get the current user
export function getCurrentUser() {
    return currentUser;
}

// Helper para fazer requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(error.error || 'Erro na requisição');
    }

    return response.json();
}

// Entity para WeightEntry
const WeightEntry = {
    async list(orderBy = '', limit = 100) {
        if (!currentUser) return [];

        const entries = await apiRequest(`/api/entries/${currentUser.id}`);

        // Handle ordering (server já retorna ordenado por date DESC, mas mantemos compatibilidade)
        if (orderBy) {
            const desc = orderBy.startsWith('-');
            const field = desc ? orderBy.slice(1) : orderBy;

            entries.sort((a, b) => {
                const aVal = a[field];
                const bVal = b[field];
                if (aVal < bVal) return desc ? 1 : -1;
                if (aVal > bVal) return desc ? -1 : 1;
                return 0;
            });
        }

        // Apply limit
        if (limit && limit > 0) {
            return entries.slice(0, limit);
        }

        return entries;
    },

    async create(item) {
        if (!currentUser) throw new Error('Usuário não logado');

        return apiRequest('/api/entries', {
            method: 'POST',
            body: JSON.stringify({
                user_id: currentUser.id,
                weight: item.weight,
                date: item.date,
                notes: item.notes
            })
        });
    },

    async update(id, updates) {
        // Para update, deletamos e recriamos (simplificação)
        // Em produção, adicionaríamos uma rota PUT
        await this.delete(id);
        return this.create(updates);
    },

    async delete(id) {
        return apiRequest(`/api/entries/${id}`, {
            method: 'DELETE'
        });
    },

    async get(id) {
        const entries = await this.list();
        return entries.find(e => e.id === id) || null;
    }
};

// Entity para WeightGoal
const WeightGoal = {
    async list() {
        if (!currentUser) return [];

        const goal = await apiRequest(`/api/goals/${currentUser.id}`);
        return goal ? [goal] : [];
    },

    async create(item) {
        if (!currentUser) throw new Error('Usuário não logado');

        return apiRequest('/api/goals', {
            method: 'POST',
            body: JSON.stringify({
                user_id: currentUser.id,
                ...item
            })
        });
    },

    async update(id, updates) {
        return this.create(updates);
    },

    async delete(id) {
        // Goals geralmente não são deletados, apenas atualizados
        return { success: true };
    },

    async get(id) {
        const goals = await this.list();
        return goals[0] || null;
    }
};

export const base44 = {
    entities: {
        WeightEntry,
        WeightGoal,
    },
    setCurrentUser,
    getCurrentUser
};

export default base44;

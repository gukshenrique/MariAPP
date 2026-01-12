// Mock do cliente Base44 usando localStorage para persistência
// Suporta múltiplos usuários com dados separados

let currentUsername = null;

// Set the current user for data isolation
export function setCurrentUser(username) {
    currentUsername = username;
}

// Get the current user
export function getCurrentUser() {
    return currentUsername;
}

function getStorageKey(entityName) {
    if (!currentUsername) {
        // Fallback to global storage if no user logged in
        return `mariapp_${entityName.toLowerCase()}`;
    }
    return `mariapp_user_${currentUsername}_${entityName.toLowerCase()}`;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getStorageData(entityName) {
    const key = getStorageKey(entityName);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function setStorageData(entityName, data) {
    const key = getStorageKey(entityName);
    localStorage.setItem(key, JSON.stringify(data));
}

function createEntity(entityName) {
    return {
        async list(orderBy = '', limit = 100) {
            let data = getStorageData(entityName);

            // Handle ordering
            if (orderBy) {
                const desc = orderBy.startsWith('-');
                const field = desc ? orderBy.slice(1) : orderBy;

                data.sort((a, b) => {
                    const aVal = a[field];
                    const bVal = b[field];

                    if (aVal < bVal) return desc ? 1 : -1;
                    if (aVal > bVal) return desc ? -1 : 1;
                    return 0;
                });
            }

            // Apply limit
            if (limit && limit > 0) {
                data = data.slice(0, limit);
            }

            return data;
        },

        async create(item) {
            const data = getStorageData(entityName);
            const newItem = {
                ...item,
                id: generateId(),
                created_date: new Date().toISOString(),
            };
            data.push(newItem);
            setStorageData(entityName, data);
            return newItem;
        },

        async update(id, updates) {
            const data = getStorageData(entityName);
            const index = data.findIndex(item => item.id === id);

            if (index === -1) {
                throw new Error(`Item with id ${id} not found`);
            }

            data[index] = { ...data[index], ...updates };
            setStorageData(entityName, data);
            return data[index];
        },

        async delete(id) {
            const data = getStorageData(entityName);
            const filtered = data.filter(item => item.id !== id);
            setStorageData(entityName, filtered);
            return { success: true };
        },

        async get(id) {
            const data = getStorageData(entityName);
            return data.find(item => item.id === id) || null;
        },
    };
}

export const base44 = {
    entities: {
        WeightEntry: createEntity('WeightEntry'),
        WeightGoal: createEntity('WeightGoal'),
    },
};

export default base44;

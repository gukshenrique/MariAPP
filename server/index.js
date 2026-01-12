require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, queryAll, queryOne, run } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve arquivos estáticos do frontend (React build)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// ============================================
// ROTAS DE USUÁRIO
// ============================================

// POST /api/users/register - Cria novo usuário com senha
app.post('/api/users/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || username.trim().length < 2) {
            return res.status(400).json({ error: 'Nome deve ter pelo menos 2 caracteres' });
        }

        if (!password || password.length < 4) {
            return res.status(400).json({ error: 'Senha deve ter pelo menos 4 caracteres' });
        }

        const name = username.trim();

        // Verifica se usuário já existe
        const existing = await queryOne('SELECT id FROM users WHERE username = ? COLLATE NOCASE', [name]);
        if (existing) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }

        // Cria novo usuário
        const result = await run('INSERT INTO users (username, password, name) VALUES (?, ?, ?)', [name, password, name]);
        const user = await queryOne('SELECT id, username, name, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);

        res.json({ success: true, user });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST /api/users/login - Verifica credenciais e retorna usuário
app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
        }

        const name = username.trim();

        // Busca usuário
        const user = await queryOne('SELECT * FROM users WHERE username = ? COLLATE NOCASE', [name]);

        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        // Verifica senha
        if (user.password !== password) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        // Retorna usuário sem a senha
        delete user.password;
        res.json({ success: true, user });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ============================================
// ROTAS DE REGISTROS DE PESO
// ============================================

// GET /api/entries/:userId - Lista registros do usuário
app.get('/api/entries/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const entries = await queryAll(`
            SELECT * FROM weight_entries 
            WHERE user_id = ? 
            ORDER BY date DESC
        `, [parseInt(userId)]);

        res.json(entries);
    } catch (error) {
        console.error('Erro ao listar entries:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST /api/entries - Cria novo registro
app.post('/api/entries', async (req, res) => {
    try {
        const { user_id, weight, date, notes } = req.body;

        if (!user_id || !weight || !date) {
            return res.status(400).json({ error: 'user_id, weight e date são obrigatórios' });
        }

        const result = await run(`
            INSERT INTO weight_entries (user_id, weight, date, notes)
            VALUES (?, ?, ?, ?)
        `, [user_id, weight, date, notes || null]);

        const entry = await queryOne('SELECT * FROM weight_entries WHERE id = ?', [result.lastInsertRowid]);
        res.json(entry);
    } catch (error) {
        console.error('Erro ao criar entry:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// DELETE /api/entries/:id - Remove registro
app.delete('/api/entries/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await run('DELETE FROM weight_entries WHERE id = ?', [parseInt(id)]);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar entry:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ============================================
// ROTAS DE METAS
// ============================================

// GET /api/goals/:userId - Retorna meta do usuário
app.get('/api/goals/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const goal = await queryOne('SELECT * FROM weight_goals WHERE user_id = ?', [parseInt(userId)]);
        res.json(goal || null);
    } catch (error) {
        console.error('Erro ao buscar goal:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST /api/goals - Cria ou atualiza meta
app.post('/api/goals', async (req, res) => {
    try {
        const { user_id, target_weight, target_date, initial_weight, daily_goal, weekly_goal, monthly_goal } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'user_id é obrigatório' });
        }

        // Verifica se já existe meta para o usuário
        const existing = await queryOne('SELECT id FROM weight_goals WHERE user_id = ?', [user_id]);

        if (existing) {
            // Atualiza
            await run(`
                UPDATE weight_goals SET 
                    target_weight = ?,
                    target_date = ?,
                    initial_weight = ?,
                    daily_goal = ?,
                    weekly_goal = ?,
                    monthly_goal = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            `, [target_weight, target_date, initial_weight, daily_goal, weekly_goal, monthly_goal, user_id]);
        } else {
            // Cria
            await run(`
                INSERT INTO weight_goals (user_id, target_weight, target_date, initial_weight, daily_goal, weekly_goal, monthly_goal)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [user_id, target_weight, target_date, initial_weight, daily_goal, weekly_goal, monthly_goal]);
        }

        const goal = await queryOne('SELECT * FROM weight_goals WHERE user_id = ?', [user_id]);
        res.json(goal);
    } catch (error) {
        console.error('Erro ao salvar goal:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// SPA FALLBACK - Serve index.html para rotas do React
// ============================================
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Inicia o servidor após inicializar o banco
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Falha ao inicializar banco:', err);
    process.exit(1);
});

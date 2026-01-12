const { createClient } = require('@libsql/client');

// Conecta ao Turso (SQLite na nuvem)
const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Inicializa o banco de dados (cria tabelas se não existirem)
async function initDatabase() {
    console.log('🔌 Conectando ao Turso...');

    // Cria tabela de usuários
    await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL COLLATE NOCASE,
            password TEXT NOT NULL,
            name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Cria tabela de registros de peso
    await db.execute(`
        CREATE TABLE IF NOT EXISTS weight_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            weight REAL NOT NULL,
            date TEXT NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Cria tabela de metas
    await db.execute(`
        CREATE TABLE IF NOT EXISTS weight_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            target_weight REAL,
            target_date TEXT,
            initial_weight REAL,
            daily_goal REAL,
            weekly_goal REAL,
            monthly_goal REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    console.log('✅ Banco de dados Turso inicializado!');
}

// Helper: Executa query e retorna todas as linhas
async function queryAll(sql, params = []) {
    const result = await db.execute({ sql, args: params });
    return result.rows;
}

// Helper: Executa query e retorna primeira linha
async function queryOne(sql, params = []) {
    const result = await db.execute({ sql, args: params });
    return result.rows[0] || null;
}

// Helper: Executa INSERT/UPDATE/DELETE e retorna lastInsertRowid
async function run(sql, params = []) {
    const result = await db.execute({ sql, args: params });
    return { lastInsertRowid: Number(result.lastInsertRowid) };
}

module.exports = {
    db,
    initDatabase,
    queryAll,
    queryOne,
    run
};

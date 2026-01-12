// Script para exportar dados do banco SQLite para JSON
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'mariapp.db');

async function exportDatabase() {
    const SQL = await initSqlJs();

    if (!fs.existsSync(DB_PATH)) {
        console.log('Banco não encontrado');
        return;
    }

    const fileBuffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(fileBuffer);

    const result = {
        users: [],
        weight_entries: [],
        weight_goals: []
    };

    // Usuários
    const users = db.exec('SELECT * FROM users');
    if (users.length > 0) {
        const cols = users[0].columns;
        result.users = users[0].values.map(row => {
            const obj = {};
            cols.forEach((col, i) => obj[col] = row[i]);
            return obj;
        });
    }

    // Entries
    const entries = db.exec('SELECT * FROM weight_entries');
    if (entries.length > 0) {
        const cols = entries[0].columns;
        result.weight_entries = entries[0].values.map(row => {
            const obj = {};
            cols.forEach((col, i) => obj[col] = row[i]);
            return obj;
        });
    }

    // Goals
    const goals = db.exec('SELECT * FROM weight_goals');
    if (goals.length > 0) {
        const cols = goals[0].columns;
        result.weight_goals = goals[0].values.map(row => {
            const obj = {};
            cols.forEach((col, i) => obj[col] = row[i]);
            return obj;
        });
    }

    // Salva em JSON
    fs.writeFileSync('db-export.json', JSON.stringify(result, null, 2));
    console.log('Dados exportados para db-export.json');

    db.close();
}

exportDatabase().catch(console.error);

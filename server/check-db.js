// Script para verificar dados do banco SQLite
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'mariapp.db');

async function checkDatabase() {
    const SQL = await initSqlJs();

    if (!fs.existsSync(DB_PATH)) {
        console.log('❌ Banco de dados não encontrado:', DB_PATH);
        return;
    }

    const fileBuffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(fileBuffer);

    console.log('========================================');
    console.log('   MariAPP - Verificação do Banco');
    console.log('========================================\n');

    // Usuários
    console.log('📋 USUÁRIOS:');
    const users = db.exec('SELECT id, username, name, created_at FROM users');
    if (users.length > 0) {
        console.table(users[0].values.map(row => ({
            id: row[0],
            username: row[1],
            name: row[2],
            created_at: row[3]
        })));
    } else {
        console.log('   Nenhum usuário cadastrado\n');
    }

    // Registros de Peso
    console.log('\n⚖️ REGISTROS DE PESO:');
    const entries = db.exec('SELECT id, user_id, weight, date, notes FROM weight_entries ORDER BY date DESC');
    if (entries.length > 0) {
        console.table(entries[0].values.map(row => ({
            id: row[0],
            user_id: row[1],
            weight: row[2],
            date: row[3],
            notes: row[4]
        })));
    } else {
        console.log('   Nenhum registro de peso\n');
    }

    // Metas
    console.log('\n🎯 METAS:');
    const goals = db.exec('SELECT * FROM weight_goals');
    if (goals.length > 0) {
        console.table(goals[0].values.map(row => ({
            id: row[0],
            user_id: row[1],
            target_weight: row[2],
            target_date: row[3],
            initial_weight: row[4],
            daily_goal: row[5],
            weekly_goal: row[6],
            monthly_goal: row[7]
        })));
    } else {
        console.log('   Nenhuma meta cadastrada\n');
    }

    db.close();
}

checkDatabase().catch(console.error);

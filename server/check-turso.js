require('dotenv').config();
const { createClient } = require('@libsql/client');

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkData() {
    console.log('========================================');
    console.log('   MariAPP - Dados no Turso');
    console.log('========================================\n');

    // Usuários
    console.log('👤 USUÁRIOS:');
    const users = await db.execute('SELECT id, username, password, created_at FROM users');
    if (users.rows.length > 0) {
        console.table(users.rows);
    } else {
        console.log('   Nenhum usuário\n');
    }

    // Entries
    console.log('\n⚖️ REGISTROS DE PESO:');
    const entries = await db.execute('SELECT * FROM weight_entries');
    if (entries.rows.length > 0) {
        console.table(entries.rows);
    } else {
        console.log('   Nenhum registro\n');
    }

    // Goals
    console.log('\n🎯 METAS:');
    const goals = await db.execute('SELECT * FROM weight_goals');
    if (goals.rows.length > 0) {
        console.table(goals.rows);
    } else {
        console.log('   Nenhuma meta\n');
    }
}

checkData().catch(console.error);

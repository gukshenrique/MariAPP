# MariAPP

Aplicativo de acompanhamento de peso com metas diárias, semanais e mensais.

## 🚀 Como Executar

### Opção 1: Script Automático (Recomendado)
Dê um duplo clique no arquivo `start.bat` na raiz do projeto.
Isso abrirá duas janelas:
- **Backend** (API + SQLite) em `http://localhost:3001`
- **Frontend** (React) em `http://localhost:5173`

### Opção 2: Manual
```bash
# Terminal 1 - Backend
cd server
npm install  # apenas na primeira vez
npm start

# Terminal 2 - Frontend
npm install  # apenas na primeira vez
npm run dev
```

## 📁 Estrutura do Projeto

```
MariAPP/
├── src/                    # Frontend React
│   ├── api/                # Cliente API
│   ├── components/         # Componentes UI
│   ├── contexts/           # Contextos (Auth)
│   └── pages/              # Páginas
├── server/                 # Backend Node.js
│   ├── index.js            # Servidor Express
│   ├── database.js         # Configuração SQLite
│   └── mariapp.db          # Banco de dados
└── start.bat               # Script de inicialização
```

## 🔐 Autenticação

- **Registrar**: Crie uma conta com usuário e senha
- **Login**: Entre com suas credenciais
- Dados salvos no SQLite por usuário

## 🛠️ Tecnologias

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite (sql.js)

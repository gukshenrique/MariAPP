#!/bin/bash
# Script de build para Render - Constrói frontend e instala dependências do backend

echo "📦 Instalando dependências do frontend..."
npm install

echo "🔨 Construindo frontend (React)..."
npm run build

echo "📦 Instalando dependências do backend..."
cd server
npm install

echo "✅ Build concluído!"

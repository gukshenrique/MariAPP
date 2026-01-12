@echo off
echo ========================================
echo    MariAPP - Iniciando Servidores
echo ========================================
echo.

:: Inicia o backend em uma nova janela
echo [1/2] Iniciando Backend (SQLite API)...
start "MariAPP Backend" cmd /k "cd /d %~dp0server && npm start"

:: Aguarda 2 segundos para o backend iniciar
timeout /t 2 /nobreak > nul

:: Inicia o frontend em uma nova janela
echo [2/2] Iniciando Frontend (React)...
start "MariAPP Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo    Servidores iniciados!
echo ========================================
echo.
echo  Backend:  http://localhost:3001
echo  Frontend: http://localhost:5173
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause > nul

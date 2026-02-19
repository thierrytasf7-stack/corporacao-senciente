@echo off
REM =================================================================
REM DIANA CORPORAÇÃO SENCIENTE - INICIAR TODOS AMBIENTES
REM =================================================================

echo.
echo ========================================
echo  DIANA CORP - Multi-Ambiente Starter
echo ========================================
echo.

REM Verificar se Node está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não encontrado!
    echo Instale Node.js 18+ primeiro
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

REM Perguntar quais ambientes iniciar
echo Selecione os ambientes para iniciar:
echo.
echo [1] DNA Arena V2 (SIMULACAO - Recomendado SEMPRE rodar)
echo [2] Testnet Futures (TESTE)
echo [3] Testnet Spot (TESTE)
echo [4] Mainnet Futures (DINHEIRO REAL)
echo [5] Mainnet Spot (DINHEIRO REAL)
echo [6] TODOS (Arena + Testnets)
echo [7] SOMENTE Arena V2
echo.
set /p choice="Escolha (1-7): "

echo.
echo Iniciando...
echo.

if "%choice%"=="1" goto :arena
if "%choice%"=="2" goto :testnet-futures
if "%choice%"=="3" goto :testnet-spot
if "%choice%"=="4" goto :mainnet-futures
if "%choice%"=="5" goto :mainnet-spot
if "%choice%"=="6" goto :all
if "%choice%"=="7" goto :arena-only

echo Opção inválida!
exit /b 1

:arena
echo 🏟️  Iniciando DNA Arena V2 + Testnet Futures...
start "DNA Arena V2" cmd /k "npm run start:arena-v2"
timeout /t 5 /nobreak >nul
start "Testnet Futures" cmd /k "npm run start:testnet-futures"
goto :end

:testnet-futures
echo 🟢 Iniciando Testnet Futures...
start "Testnet Futures" cmd /k "npm run start:testnet-futures"
goto :end

:testnet-spot
echo 🟡 Iniciando Testnet Spot...
start "Testnet Spot" cmd /k "npm run start:testnet-spot"
goto :end

:mainnet-futures
echo.
echo ⚠️  ATENÇÃO: Mainnet Futures usa DINHEIRO REAL!
echo.
set /p confirm="Tem certeza? (S/N): "
if /i not "%confirm%"=="S" (
    echo Cancelado.
    exit /b 0
)
echo 🔴 Iniciando Mainnet Futures...
start "Mainnet Futures" cmd /k "npm run start:mainnet-futures"
goto :end

:mainnet-spot
echo.
echo ⚠️  ATENÇÃO: Mainnet Spot usa DINHEIRO REAL!
echo.
set /p confirm="Tem certeza? (S/N): "
if /i not "%confirm%"=="S" (
    echo Cancelado.
    exit /b 0
)
echo 🔵 Iniciando Mainnet Spot...
start "Mainnet Spot" cmd /k "npm run start:mainnet-spot"
goto :end

:all
echo 🚀 Iniciando TODOS ambientes (Arena + Testnets)...
start "DNA Arena V2" cmd /k "npm run start:arena-v2"
timeout /t 5 /nobreak >nul
start "Testnet Futures" cmd /k "npm run start:testnet-futures"
timeout /t 5 /nobreak >nul
start "Testnet Spot" cmd /k "npm run start:testnet-spot"
goto :end

:arena-only
echo 🏟️  Iniciando SOMENTE DNA Arena V2...
start "DNA Arena V2" cmd /k "npm run start:arena-v2"
goto :end

:end
echo.
echo ✅ Ambientes iniciados!
echo.
echo ========================================
echo  Status dos Ambientes
echo ========================================
echo.
echo DNA Arena V2:      http://localhost:21340
echo Testnet Futures:   http://localhost:21342
echo Testnet Spot:      http://localhost:21343
echo Mainnet Futures:   http://localhost:21344
echo Mainnet Spot:      http://localhost:21345
echo.
echo Pressione qualquer tecla para sair...
pause >nul

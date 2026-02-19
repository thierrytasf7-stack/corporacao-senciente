@echo off
echo ========================================
echo  NBA Scraper - Dados Historicos Reais
echo ========================================
echo.

cd /d "%~dp0"

:: Verifica Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python nao encontrado. Instale em python.org
    pause
    exit /b 1
)

:: Instala dependencias se necessario
echo Verificando dependencias...
pip show nba_api >nul 2>&1
if errorlevel 1 (
    echo Instalando nba_api...
    pip install nba_api psycopg2-binary
)

echo.
echo Escolha uma opcao:
echo   1 - Fase 1: Buscar scores finais (rapido, ~2 min)
echo   2 - Fase 2: Enriquecer com Q1-Q4 reais (lento, ~45 min)
echo   3 - Status do banco
echo   4 - Temporada especifica (2024-25 apenas)
echo.
set /p choice="Opcao [1]: "
if "%choice%"=="" set choice=1

if "%choice%"=="1" (
    echo.
    echo Iniciando Fase 1 - Final scores (3 temporadas: 2022-23, 2023-24, 2024-25)...
    python nba-scraper.py
)

if "%choice%"=="2" (
    echo.
    echo Iniciando Fase 2 - Quarter scores reais...
    echo AVISO: Isso pode levar 30-60 minutos. Pode fechar e retomar depois.
    python nba-scraper.py --quarters
)

if "%choice%"=="3" (
    python nba-scraper.py --status
)

if "%choice%"=="4" (
    python nba-scraper.py --season 2024-25
)

echo.
echo Concluido!
pause

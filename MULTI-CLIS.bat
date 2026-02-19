@echo off
setlocal enabledelayedexpansion
title MULTI-CLIS LAUNCHER - DIANA CORPORACAO SENCIENTE

:: ====================================================
:: CONFIG GLOBAL - ALTERAR AQUI PARA MUDAR CLI ENGINE
:: (vale para modo interativo E para todos os workers)
:: ====================================================
set "CLI_DEFAULT=qwen"

:: Mapeamento worker -> agente AIOS
:: Alterar os caminhos abaixo se quiser outro agente por worker
set "AGENT_genesis=Evolucao\Genesis-AIOS.md"
set "AGENT_trabalhador=Desenvolvimento\Dev-AIOS.md"
set "AGENT_revisador=Desenvolvimento\QA-AIOS.md"

:: ====================================================
:: 0. SETUP INICIAL
:: ====================================================
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

:: Modo automatico: MULTI-CLIS.bat --worker NOME CAMINHO_PROMPT
if "%~1"=="--worker" goto AUTO_MODE

cls
echo ====================================================
echo   DIANA CORPORACAO SENCIENTE - MULTI-CLI LAUNCHER
echo   Selecione os parametros de invocacao
echo ====================================================

:: ====================================================
:: 1. SELECAO DE CLI (ENGINE)
:: ====================================================
echo.
echo [1] QWEN-CODE (Recomendado)
echo [2] GEMINI CLI (Google Legacy)
echo [3] AIDER (Python Code Engine)
echo [4] CLAUDE CODE (Anthropic)
echo [5] OZ-OS CLI (Arcee Trinity)
echo.
set /p cli_choice="Escolha a Engine [1-5]: "

set "ENGINE=%CLI_DEFAULT%"
if "%cli_choice%"=="1" set "ENGINE=qwen"
if "%cli_choice%"=="2" set "ENGINE=gemini"
if "%cli_choice%"=="3" set "ENGINE=aider"
if "%cli_choice%"=="4" set "ENGINE=claude"
if "%cli_choice%"=="5" set "ENGINE=az_os"

:: ====================================================
:: 2. SELECAO DE CLASSE / SQUAD
:: ====================================================
echo.
echo ====================================================
echo   SELECAO DE CLASSE / SQUAD
echo ====================================================
echo [1] CEOs (Estrategia e Orquestracao)
echo [2] Planejamento (Business e Design)
echo [3] Desenvolvimento (Code e QA)
echo [4] Evolucao (Genesis e Skills)
echo [5] Squads (Games, Marketing, Social)
echo [6] Audit (Qualidade e Evolucao de Agentes)
echo [7] BET-SPORTS (Analytis e Ops)
echo [8] Outros (Aider, Operacoes, Entrega)
echo.
set /p class_choice="Escolha a Classe [1-8]: "

set "SUB_DIR=CEOs"
if "%class_choice%"=="1" set "SUB_DIR=CEOs"
if "%class_choice%"=="2" set "SUB_DIR=Planejamento"
if "%class_choice%"=="3" set "SUB_DIR=Desenvolvimento"
if "%class_choice%"=="4" set "SUB_DIR=Evolucao"
if "%class_choice%"=="5" set "SUB_DIR=Squads"
if "%class_choice%"=="6" set "SUB_DIR=Audit"
if "%class_choice%"=="7" set "SUB_DIR=BET-SPORTS"
if "%class_choice%"=="8" set "SUB_DIR=Aider"

:: ====================================================
:: 3. SELECAO DE AGENTE (DINAMICO)
:: ====================================================
echo.
echo ====================================================
echo   SELECAO DE AGENTE (!SUB_DIR!)
echo ====================================================
set "agent_count=0"
set "CMD_DIR=.claude\commands"
for /f "delims=" %%f in ('dir /b "%CMD_DIR%\!SUB_DIR!\*.md"') do (
    set /a "agent_count+=1"
    set "agent_list[!agent_count!]=%%f"
    echo [!agent_count!] %%f
)

echo.
set /p agent_idx="Escolha o Agente [1-!agent_count!]: "
set "CONTEXT_FILES="
if defined agent_list[%agent_idx%] (
    set "AGENT_NAME=!agent_list[%agent_idx%]!"
    set "CONTEXT_FILES=@%CMD_DIR%\!SUB_DIR!\!AGENT_NAME!"
)

:: Incluir contexto Diana fixo
if exist "CONTEXTO-DIANA.md" (
    if "!CONTEXT_FILES!"=="" (
        set "CONTEXT_FILES=@CONTEXTO-DIANA.md"
    ) else (
        set "CONTEXT_FILES=!CONTEXT_FILES! @CONTEXTO-DIANA.md"
    )
)

:: ====================================================
:: 4. SELECAO DE TAREFA (KANBAN)
:: ====================================================
echo.
echo ====================================================
echo   SELECAO DE TAREFA (KANBAN)
echo ====================================================
set "task_count=0"
if exist "docs\stories" (
    for /f "delims=" %%f in ('dir /b docs\stories\*.md') do (
        set /a "task_count+=1"
        set "task_list[!task_count!]=%%f"
        echo [!task_count!] %%f
    )
)
echo [0] Nenhuma Tarefa (Modo Livre)
echo.
set /p task_idx="Escolha a Tarefa [0-!task_count!]: "

set "SELECTED_TASK="
if not "!task_idx!"=="0" (
    if defined task_list[%task_idx%] (
        set "T_FILE=!task_list[%task_idx%]!"
        set "SELECTED_TASK=Tarefa Prioritaria: docs\stories\!T_FILE!."
    )
)

:: ====================================================
:: 5. COMANDO ADICIONAL E LANCAMENTO
:: ====================================================
echo.
echo ====================================================
echo   INSTRUCOES FINAIS
echo ====================================================
set /p user_cmd="Digite instrucao adicional (ou ENTER): "

set "FINAL_PROMPT="
if defined SELECTED_TASK set "FINAL_PROMPT=!SELECTED_TASK!"

if not "!user_cmd!"=="" (
    if defined FINAL_PROMPT (
        set "FINAL_PROMPT=!FINAL_PROMPT! !user_cmd!"
    ) else (
        set "FINAL_PROMPT=!user_cmd!"
    )
)

if not defined FINAL_PROMPT (
    set "FINAL_PROMPT=Inicie operacao e aguarde instrucoes."
)

set "COMBINED_PROMPT=!CONTEXT_FILES! !FINAL_PROMPT!"
cls
goto LAUNCH

:: ====================================================
:: MODO AUTO (workers): --worker NOME CAMINHO_PROMPT
:: Uso: MULTI-CLIS.bat --worker genesis "C:\path\to\prompt.txt"
:: ====================================================
:AUTO_MODE
set "WORKER_NAME=%~2"
set "PROMPT_FILE=%~3"
set "AGENT_OVERRIDE=%~4"
set "ENGINE=!CLI_DEFAULT!"
set "CMD_DIR=.claude\commands"

title MULTI-CLIS [WORKER: !WORKER_NAME!] - Engine: !ENGINE!

:: Agente: usa override do worker se definido, senao usa mapeamento
if defined AGENT_OVERRIDE (
    set "AGENT_REL=!AGENT_OVERRIDE!"
) else (
    set "AGENT_REL=!AGENT_%WORKER_NAME%!"
)
set "CONTEXT_FILES=@!CMD_DIR!\!AGENT_REL!"

if exist "CONTEXTO-DIANA.md" (
    set "CONTEXT_FILES=!CONTEXT_FILES! @CONTEXTO-DIANA.md"
)

:: Genesis carrega a intencao como contexto extra
if "!WORKER_NAME!"=="genesis" (
    if exist "INTENCAO-GENESIS.md" (
        set "CONTEXT_FILES=!CONTEXT_FILES! @INTENCAO-GENESIS.md"
    )
)

:: Prompt: usa @arquivo direto (evita limite 8191 chars da variavel Windows)
:: Se PROMPT_FILE existe, inclui como @arquivo junto ao contexto
:: Caso contrario, usa instrucao padrao
if exist "!PROMPT_FILE!" (
    set "COMBINED_PROMPT=!CONTEXT_FILES! @!PROMPT_FILE!"
) else (
    set "COMBINED_PROMPT=!CONTEXT_FILES! Inicie operacao referente ao worker !WORKER_NAME! e aguarde instrucoes."
)

cls
echo ====================================================
echo   WORKER: !WORKER_NAME! ^| ENGINE: !ENGINE!
echo   Agente: !AGENT_REL!
echo ====================================================
echo.

goto LAUNCH

:: ====================================================
:: EXECUCAO DA ENGINE
:: ====================================================
:LAUNCH
if "!ENGINE!"=="aider" (
    aider --yes --auto-commits --message "!COMBINED_PROMPT!"
) else if "!ENGINE!"=="claude" (
    claude "!COMBINED_PROMPT!"
) else if "!ENGINE!"=="az_os" (
    python -m az_os !COMBINED_PROMPT!
) else if "!ENGINE!"=="gemini" (
    gemini --yolo --include-directories . -i "!COMBINED_PROMPT!"
) else (
    qwen --yolo --include-directories . -i "!COMBINED_PROMPT!"
)

echo.
echo ====================================================
echo   Sessao Finalizada.
echo ====================================================
pause

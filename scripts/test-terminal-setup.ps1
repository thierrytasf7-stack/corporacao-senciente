# test-terminal-setup.ps1 - Diagnóstico do ambiente Windows Terminal
$ROOT = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"
$SCRIPTS = Join-Path $ROOT "scripts"

Write-Host "=== DIAGNOSTICO DIANA TERMINAL SETUP ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Python
Write-Host "[1] Python..." -NoNewline
try {
    $pyVersion = python --version 2>&1
    Write-Host " OK - $pyVersion" -ForegroundColor Green
} catch {
    Write-Host " ERRO - Python nao encontrado!" -ForegroundColor Red
}

# 2. Verificar Claude CLI
Write-Host "[2] Claude CLI..." -NoNewline
try {
    $claudeVersion = claude --version 2>&1
    if ($claudeVersion -match "claude") {
        Write-Host " OK - $claudeVersion" -ForegroundColor Green
    } else {
        Write-Host " WARN - Resposta inesperada: $claudeVersion" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ERRO - Claude CLI nao encontrado!" -ForegroundColor Red
}

# 3. Verificar PowerShell version
Write-Host "[3] PowerShell..." -NoNewline
Write-Host " OK - $($PSVersionTable.PSVersion)" -ForegroundColor Green

# 4. Verificar scripts Python
Write-Host "[4] Scripts Sentinela..." -ForegroundColor White
$pythonScripts = @(
    "sentinela-genesis.py",
    "sentinela-escrivao.py",
    "sentinela-revisador.py"
)
foreach ($script in $pythonScripts) {
    $path = Join-Path $SCRIPTS $script
    if (Test-Path $path) {
        Write-Host "  [OK] $script" -ForegroundColor Green
        # Test syntax
        $syntaxCheck = python -m py_compile $path 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "    SYNTAX ERROR: $syntaxCheck" -ForegroundColor Red
        }
    } else {
        Write-Host "  [ERRO] $script NAO ENCONTRADO!" -ForegroundColor Red
    }
}

# 5. Verificar script PowerShell worker
Write-Host "[5] Claude Worker..." -ForegroundColor White
$workerPath = Join-Path $SCRIPTS "claude-worker.ps1"
if (Test-Path $workerPath) {
    Write-Host "  [OK] claude-worker.ps1" -ForegroundColor Green
    # Test syntax
    $errors = $null
    [System.Management.Automation.PSParser]::Tokenize((Get-Content $workerPath -Raw), [ref]$errors) | Out-Null
    if ($errors.Count -eq 0) {
        Write-Host "    Syntax OK" -ForegroundColor Green
    } else {
        Write-Host "    SYNTAX ERRORS:" -ForegroundColor Red
        $errors | ForEach-Object { Write-Host "      $_" -ForegroundColor Red }
    }
} else {
    Write-Host "  [ERRO] claude-worker.ps1 NAO ENCONTRADO!" -ForegroundColor Red
}

# 6. Verificar BAT wrappers
Write-Host "[6] BAT Wrappers..." -ForegroundColor White
$batFiles = @(
    "run-sentinela-genesis.bat",
    "run-claude-sentinela.bat",
    "run-sentinela-escrivao.bat",
    "run-claude-escrivao.bat",
    "run-sentinela-revisador.bat",
    "run-claude-revisador.bat"
)
foreach ($bat in $batFiles) {
    $path = Join-Path $SCRIPTS $bat
    if (Test-Path $path) {
        Write-Host "  [OK] $bat" -ForegroundColor Green
    } else {
        Write-Host "  [ERRO] $bat NAO ENCONTRADO!" -ForegroundColor Red
    }
}

# 7. Verificar diretório ETAPAS
Write-Host "[7] ETAPAS Senciencia..." -ForegroundColor White
$etapasDir = Join-Path $ROOT "docs\reports\METRICAS_DIRECAO_EVOLUCAO\TASKS-144-ETAPAS"
if (Test-Path $etapasDir) {
    $etapaFiles = Get-ChildItem "$etapasDir\ETAPA_*.md" -ErrorAction SilentlyContinue
    if ($etapaFiles) {
        Write-Host "  [OK] $($etapaFiles.Count) arquivos ETAPA encontrados" -ForegroundColor Green
        $etapa002 = Join-Path $etapasDir "ETAPA_002.md"
        if (Test-Path $etapa002) {
            Write-Host "  [OK] ETAPA_002.md (etapa atual)" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] ETAPA_002.md nao encontrada!" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [ERRO] Nenhum arquivo ETAPA_*.md encontrado!" -ForegroundColor Red
    }
} else {
    Write-Host "  [ERRO] Diretorio ETAPAS nao encontrado!" -ForegroundColor Red
}

# 8. Verificar env vars necessárias
Write-Host "[8] Environment..." -ForegroundColor White
$gitBashPath = $env:CLAUDE_CODE_GIT_BASH_PATH
if ($gitBashPath) {
    Write-Host "  [OK] CLAUDE_CODE_GIT_BASH_PATH = $gitBashPath" -ForegroundColor Green
    if (Test-Path $gitBashPath) {
        Write-Host "    Git Bash encontrado" -ForegroundColor Green
    } else {
        Write-Host "    WARN: Path nao existe!" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [INFO] CLAUDE_CODE_GIT_BASH_PATH nao definida (vai usar default)" -ForegroundColor Gray
}

# 9. Verificar sessões Claude
Write-Host "[9] Claude Sessions..." -ForegroundColor White
$sessionsDir = "$env:USERPROFILE\.claude\projects\C--Users-User-Desktop-Diana-Corporacao-Senciente"
if (Test-Path $sessionsDir) {
    $sessions = Get-ChildItem "$sessionsDir\*.jsonl" -ErrorAction SilentlyContinue
    if ($sessions) {
        Write-Host "  [OK] $($sessions.Count) sessoes encontradas" -ForegroundColor Green
    } else {
        Write-Host "  [INFO] Nenhuma sessao existente (sera criada no primeiro run)" -ForegroundColor Gray
    }
} else {
    Write-Host "  [INFO] Diretorio de sessoes nao existe (sera criado)" -ForegroundColor Gray
}

# 10. Verificar heartbeat dir
Write-Host "[10] Heartbeat Dir..." -ForegroundColor White
$heartbeatDir = "C:\AIOS\workers"
if (Test-Path $heartbeatDir) {
    Write-Host "  [OK] C:\AIOS\workers existe" -ForegroundColor Green
} else {
    Write-Host "  [INFO] C:\AIOS\workers nao existe (sera criado)" -ForegroundColor Gray
    New-Item -ItemType Directory -Path $heartbeatDir -Force | Out-Null
    Write-Host "  [OK] Diretorio criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== DIAGNOSTICO COMPLETO ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para testar manualmente:" -ForegroundColor White
Write-Host "  1. cd scripts" -ForegroundColor Gray
Write-Host "  2. .\run-sentinela-genesis.bat (top pane)" -ForegroundColor Gray
Write-Host "  3. .\run-claude-sentinela.bat (bottom pane)" -ForegroundColor Gray
Write-Host ""

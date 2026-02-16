$ErrorActionPreference = "Stop"

# Caminhos
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path "$ScriptDir\..\..").Path
$WorkerScript = "$ProjectRoot\docker\hive-guardian\aider-worker-executor.py"

Write-Host ">>> Iniciando Hive Guardian Executor (Modo Nativo 2026)" -ForegroundColor Green
Write-Host "Project Root: $ProjectRoot"

# Configurar Ambiente
$env:PROJECT_ROOT = $ProjectRoot
$env:PYTHONIOENCODING = "utf-8"
$env:FORCE_COLOR = "true"

# Executar Worker
Write-Host ">>> Executando Worker..." -ForegroundColor Green
python $WorkerScript

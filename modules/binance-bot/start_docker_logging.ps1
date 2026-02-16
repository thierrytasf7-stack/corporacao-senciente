# SISTEMA DE LOGS DOCKER - AURA BOT
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SISTEMA DE LOGS DOCKER - AURA BOT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Iniciando captura de logs reais do Docker..." -ForegroundColor Yellow
Write-Host "SOBRESCREVENDO automaticamente a cada 5 segundos" -ForegroundColor Yellow
Write-Host ""

# Verificar se Python está disponível
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Python não encontrado!" -ForegroundColor Red
    Write-Host "💡 Instale o Python e tente novamente" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se Docker está disponível
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker não encontrado!" -ForegroundColor Red
    Write-Host "💡 Instale o Docker e tente novamente" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se containers estão rodando
try {
    $containers = docker ps 2>&1 | Select-String "aura-binance"
    if ($containers) {
        Write-Host "✅ Containers aura-binance encontrados:" -ForegroundColor Green
        $containers | ForEach-Object { Write-Host "   • $_" -ForegroundColor Gray }
    }
    else {
        Write-Host "⚠️  Containers aura-binance não encontrados!" -ForegroundColor Yellow
        Write-Host "💡 Execute: docker-compose up -d" -ForegroundColor Yellow
        Read-Host "Pressione Enter para sair"
        exit 1
    }
}
catch {
    Write-Host "❌ Erro ao verificar containers Docker" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "🚀 Executando captura de logs Docker..." -ForegroundColor Green
Write-Host "📝 SOBRESCREVENDO LOGS-CONSOLE-FRONTEND.JSON a cada 5 segundos" -ForegroundColor Green
try {
    python docker_real_logger.py --continuous 5
}
catch {
    Write-Host "❌ Erro ao executar captura de logs Docker: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Captura de logs Docker finalizada" -ForegroundColor Green
Read-Host "Pressione Enter para sair"

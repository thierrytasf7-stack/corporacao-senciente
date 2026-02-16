# SISTEMA DE LOGS REAIS - AURA BOT
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SISTEMA DE LOGS REAIS - AURA BOT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Iniciando captura de logs reais..." -ForegroundColor Yellow
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

# Executar captura de logs reais
Write-Host "🚀 Executando captura de logs..." -ForegroundColor Green
try {
    python simple_real_logger.py --continuous 10
}
catch {
    Write-Host "❌ Erro ao executar captura de logs: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Captura de logs finalizada" -ForegroundColor Green
Read-Host "Pressione Enter para sair"

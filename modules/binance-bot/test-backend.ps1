# Script simples para testar backend
Write-Host "🧪 Testando conexão com backend..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:13001/api/test" -Method GET
    $data = $response.Content | ConvertFrom-Json

    Write-Host "✅ BACKEND FUNCIONANDO!" -ForegroundColor Green
    Write-Host "📊 Status: $($data.success)" -ForegroundColor Yellow
    Write-Host "💬 Mensagem: $($data.message)" -ForegroundColor Yellow
    Write-Host "⏰ Timestamp: $($data.timestamp)" -ForegroundColor Yellow
    Write-Host "📦 Versão: $($data.version)" -ForegroundColor Yellow

}
catch {
    Write-Host "❌ ERRO DE CONEXÃO!" -ForegroundColor Red
    Write-Host "🔍 Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Verifique se o backend está rodando na porta 13001" -ForegroundColor Yellow
}

Write-Host "`n🎯 Testando endpoint da Binance..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:13001/api/v1/binance/test-connection" -Method GET
    $data = $response.Content | ConvertFrom-Json

    Write-Host "✅ BINANCE CONECTADO!" -ForegroundColor Green
    Write-Host "📊 Status: $($data.message)" -ForegroundColor Yellow

}
catch {
    Write-Host "❌ ERRO NA BINANCE!" -ForegroundColor Red
    Write-Host "🔍 Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Testando análise rotativa..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:13001/api/v1/rotative-analysis/status" -Method GET
    $data = $response.Content | ConvertFrom-Json

    Write-Host "✅ ANÁLISE FUNCIONANDO!" -ForegroundColor Green
    Write-Host "📊 Status: $($data.data.isRunning)" -ForegroundColor Yellow

}
catch {
    Write-Host "❌ ERRO NA ANÁLISE!" -ForegroundColor Red
    Write-Host "🔍 Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Testando sinais..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:13001/api/v1/rotative-analysis/signals" -Method GET
    $data = $response.Content | ConvertFrom-Json

    Write-Host "✅ SINAIS FUNCIONANDO!" -ForegroundColor Green
    Write-Host "📊 Total de sinais: $($data.signals.Count)" -ForegroundColor Yellow

}
catch {
    Write-Host "❌ ERRO NOS SINAIS!" -ForegroundColor Red
    Write-Host "🔍 Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTestes concluidos!" -ForegroundColor Magenta

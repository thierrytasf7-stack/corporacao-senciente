# Teste de ordem simples - Bypass do rotativo
Write-Host "🚀 Testando ordem direta via API..." -ForegroundColor Green

# Teste 1: Parar análise existente
try {
    Write-Host "1. Parando análise rotativa..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/stop" -Method POST
    Write-Host "✅ Análise parada" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro ao parar análise (ok se não estava rodando)" -ForegroundColor Yellow
}

# Teste 2: Ordem manual simples
try {
    Write-Host "2. Testando ordem MANUAL simples..." -ForegroundColor Yellow
    
    $orderData = @{
        symbol = "BTCUSDT"
        side = "BUY"
        type = "MARKET"
        quantity = "0.0001"  # Quantidade muito pequena para testar
    } | ConvertTo-Json
    
    Write-Host "📊 Dados da ordem: $orderData" -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/order" -Method POST -Body $orderData -ContentType "application/json"
    Write-Host "✅ ORDEM EXECUTADA COM SUCESSO!" -ForegroundColor Green
    Write-Host "📋 Resposta: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor White
} catch {
    Write-Host "❌ Falha na ordem manual" -ForegroundColor Red
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "🏁 Teste direto concluído!" -ForegroundColor Magenta

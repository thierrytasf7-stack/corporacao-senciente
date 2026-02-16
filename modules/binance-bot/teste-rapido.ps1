Write-Host "TESTE RAPIDO" -ForegroundColor Green

# Teste 1: Health check
try {
    $health = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend OK: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend com problema: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 2: Order endpoint
try {
    $order = @{
        symbol = "BTCUSDT"
        side = "BUY"
        type = "MARKET"
        quantity = "0.00001"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/order" -Method POST -Body $order -ContentType "application/json" -TimeoutSec 10
    
    Write-Host "🎉 ORDEM SUCESSO!" -ForegroundColor Green
    Write-Host "Resposta: $($response | ConvertTo-Json)" -ForegroundColor White
    
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "Status: $code - $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($code -eq 404) {
        Write-Host "❌ Endpoint não existe" -ForegroundColor Red
    } elseif ($code -eq 500) {
        Write-Host "✅ Endpoint existe! Erro interno" -ForegroundColor Green
    } else {
        Write-Host "Status: $code" -ForegroundColor Magenta
    }
}


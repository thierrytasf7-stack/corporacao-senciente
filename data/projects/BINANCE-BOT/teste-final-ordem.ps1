Write-Host "🚀 TESTE FINAL - ORDEM REAL" -ForegroundColor Green

# Teste simples
try {
    $body = '{"symbol":"BTCUSDT","side":"BUY","type":"MARKET","quantity":"0.00001"}'
    Write-Host "Testando endpoint /binance/order..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/order" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "🎉 SUCESSO! ORDEM EXECUTADA!" -ForegroundColor Green
    Write-Host "Resposta: $($response | ConvertTo-Json)" -ForegroundColor White
    
} catch {
    $statusCode = "N/A"
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    }
    
    Write-Host "Status: $statusCode" -ForegroundColor Yellow
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($statusCode -eq 404) {
        Write-Host "❌ Endpoint ainda não existe" -ForegroundColor Red
    } elseif ($statusCode -eq 500) {
        Write-Host "✅ Endpoint existe! Erro interno (pode ser saldo insuficiente)" -ForegroundColor Green
    } elseif ($statusCode -eq 400) {
        Write-Host "✅ Endpoint existe! Parâmetros inválidos" -ForegroundColor Green
    } else {
        Write-Host "Status: $statusCode" -ForegroundColor Magenta
    }
}


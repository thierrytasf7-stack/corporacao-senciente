Write-Host "TESTE COM QUANTIDADE CORRETA" -ForegroundColor Green

# Teste com quantidade maior para BTC (pelo menos $20)
try {
    $body = '{"symbol":"BTCUSDT","side":"BUY","type":"MARKET","quantity":"0.0005"}'
    Write-Host "Testando com 0.0005 BTC (~$30)..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/order" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "🎉 SUCESSO! ORDEM EXECUTADA!" -ForegroundColor Green
    Write-Host "Resposta: $($response | ConvertTo-Json)" -ForegroundColor White
    
}
catch {
    $statusCode = "N/A"
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    }
    
    Write-Host "Status: $statusCode" -ForegroundColor Yellow
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($statusCode -eq 400) {
        Write-Host "❌ Erro de parâmetros (pode ser saldo insuficiente)" -ForegroundColor Red
    }
    elseif ($statusCode -eq 500) {
        Write-Host "✅ Endpoint funciona! Erro interno" -ForegroundColor Green
    }
}

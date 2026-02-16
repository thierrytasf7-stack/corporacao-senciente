Write-Host "TESTE FINAL SIMPLES" -ForegroundColor Green

try {
    $body = '{"symbol":"BTCUSDT","side":"BUY","type":"MARKET","quantity":"0.00001"}'
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/order" -Method POST -Body $body -ContentType "application/json"
    Write-Host "SUCESSO: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
}


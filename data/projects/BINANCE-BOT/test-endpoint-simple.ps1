try {
    $body = '{"symbol":"BTCUSDT","side":"BUY","type":"MARKET","quantity":"0.00001"}'
    
    Write-Host "Testando endpoint /binance/order..." -ForegroundColor Cyan
    Write-Host "Body: $body" -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/order" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "SUCESSO!" -ForegroundColor Green
    Write-Host "Resposta: $($response | ConvertTo-Json)" -ForegroundColor White
    
} catch {
    $statusCode = "N/A"
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    }
    
    Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($statusCode -eq 404) {
        Write-Host "PROBLEMA: Endpoint nao existe!" -ForegroundColor Red
    } elseif ($statusCode -eq 500) {
        Write-Host "PROGRESSO: Endpoint existe mas com erro interno!" -ForegroundColor Yellow
    } elseif ($statusCode -eq 400) {
        Write-Host "PROGRESSO: Endpoint existe mas parametros invalidos!" -ForegroundColor Yellow
    } else {
        Write-Host "Status inesperado" -ForegroundColor Magenta
    }
}


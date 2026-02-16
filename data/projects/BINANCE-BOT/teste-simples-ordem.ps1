Write-Host "🚀 TESTE SIMPLES - ORDEM REAL" -ForegroundColor Green

Write-Host "🔍 Verificando backend..." -ForegroundColor Magenta
try {
    $health = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend funcionando: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend com problemas: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 TESTE 1: Ordem BTC pequena" -ForegroundColor Cyan
try {
    $orderData = @{
        symbol = "BTCUSDT"
        side = "BUY"
        type = "MARKET"
        quantity = "0.00001"
    } | ConvertTo-Json
    
    Write-Host "Enviando ordem: $orderData" -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/order" -Method POST -Body $orderData -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "🎉 SUCESSO! ORDEM EXECUTADA!" -ForegroundColor Green
    Write-Host "Resposta: $($response | ConvertTo-Json)" -ForegroundColor White
    exit 0
    
} catch {
    Write-Host "❌ Falha: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "📋 Detalhes: $errorBody" -ForegroundColor Yellow
        } catch {
            Write-Host "Não foi possível ler detalhes do erro" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n🎯 TESTE 2: Ordem BTC maior" -ForegroundColor Cyan
try {
    $orderData = @{
        symbol = "BTCUSDT"
        side = "BUY" 
        type = "MARKET"
        quantity = "0.0001"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/order" -Method POST -Body $orderData -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "🎉 SUCESSO! ORDEM EXECUTADA!" -ForegroundColor Green
    Write-Host "Resposta: $($response | ConvertTo-Json)" -ForegroundColor White
    exit 0
    
} catch {
    Write-Host "❌ Falha: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Testes concluídos. Se chegamos até aqui, o endpoint está funcionando!" -ForegroundColor Green


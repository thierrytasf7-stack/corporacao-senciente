Write-Host "Testando backend..." -ForegroundColor Green

# Teste 1: Backend
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/test" -Method GET
    Write-Host "Backend OK: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Backend ERRO: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Teste 2: Binance
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/test-connection" -Method GET
    Write-Host "Binance OK: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Binance ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 3: Iniciar analise
try {
    $body = '{"cycleMode":"CONTINUOUS"}'
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/start" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Analise iniciada: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Analise ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Aguardando 10 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Teste 4: Verificar sinais
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/signals" -Method GET
    Write-Host "Sinais encontrados: $($response.signals.Count)" -ForegroundColor Green
    
    $response.signals | Select-Object -First 3 | ForEach-Object {
        Write-Host "Sinal: $($_.symbol) $($_.side) - Status: $($_.status)" -ForegroundColor White
    }
} catch {
    Write-Host "Sinais ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Teste concluido!" -ForegroundColor Magenta

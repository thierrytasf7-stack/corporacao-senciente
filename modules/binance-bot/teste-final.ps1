Write-Host "TESTE FINAL - Sistema AURA" -ForegroundColor Green

# Backend
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/health" -Method GET -TimeoutSec 5
    Write-Host "Backend OK: $($response.status), Binance: $($response.binanceConnected)" -ForegroundColor Green
} catch {
    Write-Host "Backend ERRO: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Binance
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/test-connection" -Method GET -TimeoutSec 10
    Write-Host "Binance OK: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Binance PROBLEMA: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Precos
Write-Host "Testando precos..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/price/BTCUSDT" -Method GET -TimeoutSec 5
    Write-Host "BTCUSDT: $ $($response.price)" -ForegroundColor Green
} catch {
    Write-Host "Erro no preco BTCUSDT" -ForegroundColor Red
}

# Analise
try {
    $body = '{"cycleMode":"CONTINUOUS"}'
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/start" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "Analise iniciada: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Erro na analise: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Aguardando 20 segundos..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

# Sinais
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/signals" -Method GET -TimeoutSec 5
    $total = $response.signals.Count
    $executed = ($response.signals | Where-Object { $_.status -eq "EXECUTED" }).Count
    $failed = ($response.signals | Where-Object { $_.status -eq "FAILED" }).Count
    
    Write-Host "SINAIS - Total: $total, Executados: $executed, Falharam: $failed" -ForegroundColor White
    
    if ($executed -gt 0) {
        Write-Host "SUCESSO! Sistema executando ordens!" -ForegroundColor Green
    } elseif ($total -gt 0) {
        Write-Host "Sistema funcionando mas com falhas na execucao" -ForegroundColor Yellow
    } else {
        Write-Host "Sistema aguardando oportunidades" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Erro nos sinais: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Teste concluido!" -ForegroundColor Magenta

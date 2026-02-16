Write-Host "TESTE REAL DE ABERTURA DE POSICAO - AURA" -ForegroundColor Green

# 1. Backend
try {
    $health = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/health" -Method GET -TimeoutSec 5
    Write-Host "Backend OK: $($health.status), Binance: $($health.binanceConnected)" -ForegroundColor Green
} catch {
    Write-Host "Backend ERRO: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. Preco REAL
try {
    $price = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/price/BTCUSDT" -Method GET -TimeoutSec 5
    Write-Host "BTCUSDT REAL: $ $($price.price)" -ForegroundColor Green
} catch {
    Write-Host "Erro no preco: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 3. Iniciar analise
try {
    $body = '{"cycleMode":"CONTINUOUS"}'
    $start = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/start" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "Analise iniciada: $($start.message)" -ForegroundColor Green
} catch {
    Write-Host "Erro na analise: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Aguardar sinais
Write-Host "Aguardando 30 segundos para sinais..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# 5. Verificar resultados
try {
    $signals = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/signals" -Method GET -TimeoutSec 5
    $total = $signals.signals.Count
    $executed = ($signals.signals | Where-Object { $_.status -eq "EXECUTED" }).Count
    $failed = ($signals.signals | Where-Object { $_.status -eq "FAILED" }).Count
    
    Write-Host "RESULTADO:" -ForegroundColor Magenta
    Write-Host "Total: $total, Executados: $executed, Falharam: $failed" -ForegroundColor White
    
    if ($executed -gt 0) {
        Write-Host "SUCESSO! POSICOES ABERTAS NA BINANCE!" -ForegroundColor Green
        
        # Mostrar posicoes executadas
        $executedSignals = $signals.signals | Where-Object { $_.status -eq "EXECUTED" }
        foreach ($signal in $executedSignals) {
            Write-Host "Posicao: $($signal.symbol) $($signal.side) - Quantidade: $($signal.quantity)" -ForegroundColor Green
        }
    } elseif ($total -gt 0) {
        Write-Host "Sistema funcionando mas com falhas na execucao" -ForegroundColor Yellow
        
        # Mostrar erros
        $failedSignals = $signals.signals | Where-Object { $_.status -eq "FAILED" } | Select-Object -First 2
        foreach ($failed in $failedSignals) {
            Write-Host "Erro $($failed.symbol): $($failed.errorMessage)" -ForegroundColor Red
        }
    } else {
        Write-Host "Nenhum sinal gerado ainda" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "Erro verificando sinais: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Teste concluido!" -ForegroundColor Magenta

Write-Host "TESTE EXTENSO - AURA TRADING BOT" -ForegroundColor Green

# Verificar backend
try {
    $health = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/health" -Method GET -TimeoutSec 5
    Write-Host "Backend: $($health.status), Binance: $($health.binanceConnected)" -ForegroundColor Green
}
catch {
    Write-Host "Erro backend: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Verificar preco real (nao $1000)
try {
    $price = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/price/BTCUSDT" -Method GET -TimeoutSec 5
    Write-Host "BTCUSDT: $ $($price.price)" -ForegroundColor Cyan
    
    if ($price.price -eq 1000) {
        Write-Host "AVISO: Preco ainda eh 1000 (pode ser fallback)" -ForegroundColor Yellow
    }
    else {
        Write-Host "PRECO REAL DA BINANCE OBTIDO!" -ForegroundColor Green
    }
}
catch {
    Write-Host "Erro no preco: $($_.Exception.Message)" -ForegroundColor Red
}

# Iniciar analise
try {
    $body = '{"cycleMode":"CONTINUOUS"}'
    $start = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/start" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "Analise: $($start.message)" -ForegroundColor Green
}
catch {
    Write-Host "Erro analise: $($_.Exception.Message)" -ForegroundColor Red
}

# Monitorar por 2 minutos
Write-Host "Monitorando por 2 minutos..." -ForegroundColor Cyan
for ($i = 1; $i -le 12; $i++) {
    Write-Host "Ciclo $i/12..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    
    try {
        $signals = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/signals" -Method GET -TimeoutSec 3
        $total = $signals.signals.Count
        $executed = ($signals.signals | Where-Object { $_.status -eq "EXECUTED" }).Count
        $failed = ($signals.signals | Where-Object { $_.status -eq "FAILED" }).Count
        
        Write-Host "Sinais: $total total, $executed OK, $failed falha" -ForegroundColor White
        
        if ($total -gt 0) {
            $lastSignal = $signals.signals | Select-Object -First 1
            Write-Host "Ultimo: $($lastSignal.symbol) $($lastSignal.side) - $($lastSignal.status)" -ForegroundColor Cyan
            
            if ($lastSignal.errorMessage) {
                Write-Host "Erro: $($lastSignal.errorMessage)" -ForegroundColor Red
            }
            
            if ($executed -gt 0) {
                Write-Host "SUCESSO! POSICAO ABERTA!" -ForegroundColor Green
                break
            }
        }
    }
    catch {
        Write-Host "Erro verificando sinais" -ForegroundColor Yellow
    }
}

# Resultado final
Write-Host "RESULTADO FINAL:" -ForegroundColor Magenta
try {
    $signals = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/signals" -Method GET -TimeoutSec 5
    $total = $signals.signals.Count
    $executed = ($signals.signals | Where-Object { $_.status -eq "EXECUTED" }).Count
    $failed = ($signals.signals | Where-Object { $_.status -eq "FAILED" }).Count
    
    Write-Host "Total: $total, Executados: $executed, Falharam: $failed" -ForegroundColor White
    
    if ($executed -gt 0) {
        Write-Host "SISTEMA FUNCIONANDO - POSICOES ABERTAS!" -ForegroundColor Green
    }
    elseif ($failed -gt 0) {
        Write-Host "Sistema gerando sinais mas com problemas" -ForegroundColor Yellow
    }
    else {
        Write-Host "Aguardando condicoes de mercado favoraveis" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "Erro final: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Teste extenso concluido!" -ForegroundColor Magenta


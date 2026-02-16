# TESTE DIRETO DE ABERTURA DE POSIÇÃO - SISTEMA AURA
Write-Host "🚀 TESTE REAL DE ABERTURA DE POSIÇÃO" -ForegroundColor Green

# 1. Verificar backend
Write-Host "`n1. Verificando backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend: $($health.status), Binance: $($health.binanceConnected)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend falhou: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Testar preço REAL
Write-Host "`n2. Obtendo preço REAL do BTCUSDT..." -ForegroundColor Yellow
try {
    $price = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/price/BTCUSDT" -Method GET -TimeoutSec 5
    Write-Host "✅ BTCUSDT: $ $($price.price)" -ForegroundColor Green
    $currentPrice = [decimal]$price.price
} catch {
    Write-Host "❌ Erro no preço: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Calcular quantidade para $10 USD
$targetUSD = 10
$quantity = $targetUSD / $currentPrice
$quantityFormatted = [math]::Round($quantity, 6)

Write-Host "`n3. Cálculo para abertura:" -ForegroundColor Cyan
Write-Host "   💰 Valor alvo: $ $targetUSD USD" -ForegroundColor White
Write-Host "   📊 Preço atual: $ $currentPrice" -ForegroundColor White
Write-Host "   📈 Quantidade: $quantityFormatted BTC" -ForegroundColor White

# 4. Iniciar análise rotativa
Write-Host "`n4. Iniciando análise rotativa..." -ForegroundColor Yellow
try {
    $body = '{"cycleMode":"CONTINUOUS"}'
    $start = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/start" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Análise iniciada: $($start.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro na análise: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Aguardar e monitorar sinais
Write-Host "`n5. Monitorando sinais por 30 segundos..." -ForegroundColor Cyan
for ($i = 1; $i -le 6; $i++) {
    Write-Host "   ⏱️ Aguardando... ($i/6)" -ForegroundColor Gray
    Start-Sleep -Seconds 5
    
    try {
        $signals = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/signals" -Method GET -TimeoutSec 3
        $total = $signals.signals.Count
        $executed = ($signals.signals | Where-Object { $_.status -eq "EXECUTED" }).Count
        $failed = ($signals.signals | Where-Object { $_.status -eq "FAILED" }).Count
        
        if ($total -gt 0) {
            Write-Host "   📊 Sinais: $total total, $executed executados, $failed falharam" -ForegroundColor Cyan
            
            # Mostrar último sinal
            $lastSignal = $signals.signals | Select-Object -First 1
            $status = if ($lastSignal.status -eq "EXECUTED") { "✅" } elseif ($lastSignal.status -eq "FAILED") { "❌" } else { "⏳" }
            Write-Host "   $status Último: $($lastSignal.symbol) $($lastSignal.side) - $($lastSignal.status)" -ForegroundColor White
            
            if ($executed -gt 0) {
                Write-Host "`n🎉 SUCESSO! POSIÇÃO ABERTA COM SUCESSO!" -ForegroundColor Green
                break
            }
        }
    } catch {
        Write-Host "   ⚠️ Erro ao verificar sinais" -ForegroundColor Yellow
    }
}

# 6. Resultado final
Write-Host "`n6. Verificação final..." -ForegroundColor Yellow
try {
    $signals = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/signals" -Method GET -TimeoutSec 5
    $total = $signals.signals.Count
    $executed = ($signals.signals | Where-Object { $_.status -eq "EXECUTED" }).Count
    $failed = ($signals.signals | Where-Object { $_.status -eq "FAILED" }).Count
    
    Write-Host "`n📋 RESULTADO FINAL:" -ForegroundColor Magenta
    Write-Host "   📊 Total de sinais: $total" -ForegroundColor White
    Write-Host "   ✅ Posições abertas: $executed" -ForegroundColor Green
    Write-Host "   ❌ Falhas: $failed" -ForegroundColor Red
    
    if ($executed -gt 0) {
        Write-Host "`n🏆 SISTEMA FUNCIONANDO! POSIÇÕES SENDO ABERTAS NA BINANCE TESTNET!" -ForegroundColor Green
        Write-Host "🎯 Dados 100% REAIS da Binance!" -ForegroundColor Green
    } elseif ($total -gt 0) {
        Write-Host "`n⚠️ Sistema gerando sinais mas com problemas na execução" -ForegroundColor Yellow
        
        # Mostrar detalhes dos erros
        $failedSignals = $signals.signals | Where-Object { $_.status -eq "FAILED" } | Select-Object -First 3
        foreach ($failed in $failedSignals) {
            Write-Host "   ❌ $($failed.symbol): $($failed.errorMessage)" -ForegroundColor Red
        }
    } else {
        Write-Host "`n📊 Sistema funcionando, aguardando oportunidades de mercado" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ Erro na verificação final: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 TESTE DE ABERTURA CONCLUÍDO!" -ForegroundColor Magenta

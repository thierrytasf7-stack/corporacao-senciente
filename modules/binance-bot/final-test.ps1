# Teste final COMPLETO do sistema AURA
Write-Host "🚀 TESTE FINAL - Sistema AURA Trading Bot" -ForegroundColor Green

# Teste 1: Verificar backend
Write-Host "`n1. Verificando backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/test" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend: $($response.message)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Backend offline. Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Verifique se o backend está rodando na porta 13001" -ForegroundColor Yellow
    exit 1
}

# Teste 2: Testar conexão Binance
Write-Host "`n2. Testando conexão Binance..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/test-connection" -Method GET -TimeoutSec 10
    Write-Host "✅ Binance: $($response.message)" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Binance com problemas: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Teste 3: Preços em tempo real
Write-Host "`n3. Testando preços em tempo real..." -ForegroundColor Yellow
$symbols = @("BTCUSDT", "ETHUSDT", "SOLUSDT")
foreach ($symbol in $symbols) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/price/$symbol" -Method GET -TimeoutSec 5
        Write-Host "✅ $symbol : $ $($response.price)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro no preço $symbol : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Teste 4: Iniciar análise rotativa
Write-Host "`n4. Iniciando análise rotativa..." -ForegroundColor Yellow
try {
    $body = '{"cycleMode":"CONTINUOUS"}'
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/start" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Análise: $($response.message)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Falha na análise: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 5: Aguardar e verificar sinais
Write-Host "`n5. Aguardando geração de sinais (20 segundos)..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/signals" -Method GET -TimeoutSec 5
    $total = $response.signals.Count
    $executed = ($response.signals | Where-Object { $_.status -eq "EXECUTED" }).Count
    $failed = ($response.signals | Where-Object { $_.status -eq "FAILED" }).Count
    
    Write-Host "`n📊 RESULTADOS DOS SINAIS:" -ForegroundColor Magenta
    Write-Host "   Total: $total" -ForegroundColor White
    Write-Host "   ✅ Executados: $executed" -ForegroundColor Green
    Write-Host "   ❌ Falharam: $failed" -ForegroundColor Red
    
    if ($total -gt 0) {
        Write-Host "`n🔍 Últimos 3 sinais:" -ForegroundColor Cyan
        $response.signals | Select-Object -First 3 | ForEach-Object {
            $status = if ($_.status -eq "EXECUTED") { "✅" } elseif ($_.status -eq "FAILED") { "❌" } else { "⏳" }
            Write-Host "   $status $($_.symbol) $($_.side) - $($_.status)" -ForegroundColor White
            if ($_.errorMessage) {
                Write-Host "      💭 $($_.errorMessage)" -ForegroundColor Gray
            }
        }
    }
    
    # Avaliação final
    if ($executed -gt 0) {
        Write-Host "`n🎉 SISTEMA FUNCIONANDO! Ordens sendo executadas!" -ForegroundColor Green
    }
    elseif ($total -gt 0) {
        Write-Host "`n⚠️ Sistema gerando sinais mas com falhas na execução" -ForegroundColor Yellow
    }
    else {
        Write-Host "`n📊 Sistema rodando, aguardando oportunidades de mercado" -ForegroundColor Cyan
    }
    
}
catch {
    Write-Host "❌ Erro ao verificar sinais: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTESTE FINAL CONCLUIDO!" -ForegroundColor Magenta
Write-Host "Sistema AURA - Status avaliado com sucesso" -ForegroundColor White

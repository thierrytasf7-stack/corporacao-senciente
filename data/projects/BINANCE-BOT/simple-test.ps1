# Teste simples do backend
Write-Host "🚀 Testando backend AURA..." -ForegroundColor Green

# Teste 1: Conexão básica
Write-Host "`n1. Testando conexão básica..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/test" -Method GET
    Write-Host "✅ Backend funcionando: $($response.message)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Backend não está funcionando" -ForegroundColor Red
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 2: Conexão Binance
Write-Host "`n2. Testando conexão Binance..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/test-connection" -Method GET
    Write-Host "✅ Binance conectado: $($response.message)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Problema na Binance" -ForegroundColor Red
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 3: Status da análise
Write-Host "`n3. Testando status da análise..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/status" -Method GET
    Write-Host "✅ Análise disponível. Rodando: $($response.data.isRunning)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Problema na análise" -ForegroundColor Red
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 4: Iniciar análise
Write-Host "`n4. Iniciando análise rotativa..." -ForegroundColor Yellow
try {
    $body = @{
        cycleMode = "CONTINUOUS"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/start" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Análise iniciada: $($response.message)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Falha ao iniciar análise" -ForegroundColor Red
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Aguardando 15 segundos para geração de sinais..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# Teste 5: Verificar sinais
Write-Host "`n5. Verificando sinais gerados..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/signals" -Method GET
    $signalCount = $response.signals.Count
    Write-Host "✅ $signalCount sinais encontrados" -ForegroundColor Green
    
    if ($signalCount -gt 0) {
        Write-Host "`n📊 Últimos 3 sinais:" -ForegroundColor Cyan
        $response.signals | Select-Object -First 3 | ForEach-Object {
            $status = if ($_.status -eq "EXECUTED") { "✅" } elseif ($_.status -eq "FAILED") { "❌" } else { "⏳" }
            Write-Host "   $status $($_.symbol) $($_.side) - Status: $($_.status)" -ForegroundColor White
            if ($_.errorMessage) {
                Write-Host "      Erro: $($_.errorMessage)" -ForegroundColor Red
            }
        }
    }
}
catch {
    Write-Host "❌ Falha ao verificar sinais" -ForegroundColor Red
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTeste concluido!" -ForegroundColor Magenta

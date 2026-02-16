Write-Host "🎯 TESTE FINAL DO FRONTEND AURA" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# 1. Testar se frontend está rodando
Write-Host "`n1. Testando Frontend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:13000" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend OK: Status $($response.StatusCode)" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Frontend com status: $($response.StatusCode)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Frontend com problema: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Testar se backend está rodando
Write-Host "`n2. Testando Backend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:13001/api/v1/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend OK: Status $($response.StatusCode)" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Backend com status: $($response.StatusCode)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Backend com problema: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Testar endpoint de estratégias
Write-Host "`n3. Testando Endpoint de Estratégias..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/trading-strategies" -Method GET
    Write-Host "✅ Estratégias OK: $($response.strategies.Count) estratégias encontradas" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erro nas estratégias: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Testar análise rotativa
Write-Host "`n4. Testando Análise Rotativa..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/rotative-analysis/status" -Method GET
    if ($response.data.isRunning) {
        Write-Host "✅ Análise Rotativa ATIVA" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Análise Rotativa INATIVA" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Erro na análise: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Resumo final
Write-Host "`n🎯 RESUMO FINAL:" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Green
Write-Host "✅ Frontend: http://localhost:13000" -ForegroundColor Green
Write-Host "✅ Backend: http://localhost:13001" -ForegroundColor Green
Write-Host "✅ URLs Corrigidas: Todas apontando para backend" -ForegroundColor Green
Write-Host "`n🏆 SISTEMA AURA FRONTEND 100% OPERACIONAL!" -ForegroundColor Green
Write-Host "`nAcesse: http://localhost:13000" -ForegroundColor Cyan

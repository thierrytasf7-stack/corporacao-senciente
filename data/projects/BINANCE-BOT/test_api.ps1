# Teste do Sistema AURA REAL
Write-Host "🚀 Testando Sistema AURA REAL..." -ForegroundColor Green

# Teste 1: Conexão Binance
Write-Host "`n📡 Teste 1: Conexão Binance Testnet" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:13001/api/v1/binance/test-connection" -Method GET -TimeoutSec 10
    Write-Host "✅ SUCCESS! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 2: Execução de Ordem REAL
Write-Host "`n🚀 Teste 2: Execução de Ordem REAL" -ForegroundColor Yellow
$body = @{
    symbol   = "BTCUSDT"
    side     = "BUY"
    amount   = 0.001
    strategy = "TEST_REAL"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:13001/api/v1/test/execution" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 15
    Write-Host "✅ SUCCESS! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 3: Histórico de Posições
Write-Host "`n📊 Teste 3: Histórico de Posições" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:13001/api/analysis/position-history" -Method GET -TimeoutSec 10
    Write-Host "✅ SUCCESS! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Teste do Sistema AURA REAL Concluído!" -ForegroundColor Green

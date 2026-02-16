# Teste Simples do Sistema AURA REAL
Write-Host "🚀 Testando Sistema AURA REAL..." -ForegroundColor Green

# Teste direto com Invoke-RestMethod
Write-Host "`n📡 Teste: Conexão Binance" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/test-connection" -Method GET -TimeoutSec 10
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Result: $($result | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Teste Concluído!" -ForegroundColor Green
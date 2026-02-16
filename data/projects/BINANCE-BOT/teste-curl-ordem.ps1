Write-Host "🚀 TESTE DIRETO COM CURL" -ForegroundColor Green

# Teste 1: Verificar se endpoint existe
Write-Host "`n🔍 Testando se endpoint existe..." -ForegroundColor Cyan
$testResponse = curl -s -w "%{http_code}" -o "response.tmp" -X POST "http://localhost:13001/api/v1/binance/order" -H "Content-Type: application/json" -d '{"symbol":"BTCUSDT","side":"BUY","type":"MARKET","quantity":"0.00001"}'

Write-Host "Status HTTP: $testResponse" -ForegroundColor Yellow

if (Test-Path "response.tmp") {
    $responseBody = Get-Content "response.tmp" -Raw
    Write-Host "Resposta: $responseBody" -ForegroundColor White
    Remove-Item "response.tmp" -ErrorAction SilentlyContinue
}

if ($testResponse -eq "200") {
    Write-Host "🎉 SUCESSO! Ordem executada!" -ForegroundColor Green
} elseif ($testResponse -eq "400" -or $testResponse -eq "500") {
    Write-Host "✅ Endpoint existe! (erro $testResponse é esperado)" -ForegroundColor Green
} elseif ($testResponse -eq "404") {
    Write-Host "❌ Endpoint ainda não existe" -ForegroundColor Red
} else {
    Write-Host "⚠️ Status inesperado: $testResponse" -ForegroundColor Yellow
}

Write-Host "`nℹ️ Qualquer resposta diferente de 404 indica que o endpoint foi criado com sucesso!" -ForegroundColor Cyan


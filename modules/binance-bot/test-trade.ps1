# Script para testar um trade na Binance Testnet
Write-Host "🧪 Testando trade na Binance Testnet..." -ForegroundColor Yellow

# 1. Verificar saldos atuais
Write-Host "`n📊 Verificando saldos atuais..." -ForegroundColor Cyan
$balances = Invoke-WebRequest -Uri "http://127.0.0.1:23231/api/v1/binance/balances" -Method GET | Select-Object -ExpandProperty Content | ConvertFrom-Json
$usdtBalance = ($balances.data | Where-Object { $_.asset -eq "USDT" }).free
$btcBalance = ($balances.data | Where-Object { $_.asset -eq "BTC" }).free

Write-Host "💰 Saldo USDT: $usdtBalance" -ForegroundColor Green
Write-Host "₿ Saldo BTC: $btcBalance" -ForegroundColor Green

# 2. Verificar preço atual do BTC
Write-Host "`n💱 Verificando preço atual do BTC..." -ForegroundColor Cyan
$price = Invoke-WebRequest -Uri "http://127.0.0.1:23231/api/v1/binance/price/BTCUSDT" -Method GET | Select-Object -ExpandProperty Content | ConvertFrom-Json
Write-Host "₿ Preço BTC: $($price.data.price)" -ForegroundColor Green

# 3. Verificar trades atuais
Write-Host "`n📈 Verificando trades atuais..." -ForegroundColor Cyan
$trades = Invoke-WebRequest -Uri "http://127.0.0.1:23231/api/v1/binance/trades?limit=10" -Method GET | Select-Object -ExpandProperty Content | ConvertFrom-Json
Write-Host "📊 Total de trades: $($trades.count)" -ForegroundColor Green

if ($trades.count -eq 0) {
    Write-Host "`n⚠️  Nenhum trade encontrado!" -ForegroundColor Red
    Write-Host "Para testar o sistema:" -ForegroundColor Yellow
    Write-Host "   1. Acesse https://testnet.binance.vision/" -ForegroundColor White
    Write-Host "   2. Faça login com suas credenciais" -ForegroundColor White
    Write-Host "   3. Execute uma compra/venda de teste" -ForegroundColor White
    Write-Host "   4. Execute este script novamente" -ForegroundColor White
} else {
    Write-Host "`n✅ Trades encontrados! Sistema funcionando." -ForegroundColor Green
}

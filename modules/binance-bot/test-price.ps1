# Teste direto da API de precos da Binance
Write-Host "Testando API de precos da Binance..." -ForegroundColor Green

# Teste 1: Preco direto da Binance (sem auth)
try {
    Write-Host "1. Testando preco BTCUSDT direto da Binance..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "https://testnet.binance.vision/api/v3/ticker/price?symbol=BTCUSDT" -Method GET
    Write-Host "Preco BTCUSDT: $($response.price)" -ForegroundColor Green
}
catch {
    Write-Host "ERRO na API publica: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 2: Preco via nosso backend
try {
    Write-Host "2. Testando preco via nosso backend..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/price/BTCUSDT" -Method GET
    Write-Host "Preco via backend: $($response.price)" -ForegroundColor Green
}
catch {
    Write-Host "ERRO no backend: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Teste concluido!" -ForegroundColor Magenta

Write-Host "ANALISE DE SALDO E QUANTIDADE - AURA" -ForegroundColor Green

# 1. Verificar saldos detalhados
Write-Host "`n1. Verificando saldos..." -ForegroundColor Yellow
try {
    $balances = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/balances" -Method GET -TimeoutSec 5
    Write-Host "Saldos principais:" -ForegroundColor Cyan
    
    foreach ($balance in $balances.data) {
        if ([decimal]$balance.free -gt 0) {
            Write-Host "  $($balance.asset): $($balance.free) livre" -ForegroundColor White
        }
    }
    
    # Focar nos principais
    $btcBalance = ($balances.data | Where-Object { $_.asset -eq "BTC" }).free
    $ethBalance = ($balances.data | Where-Object { $_.asset -eq "ETH" }).free
    $usdtBalance = ($balances.data | Where-Object { $_.asset -eq "USDT" }).free
    
    Write-Host "`nSaldos principais:" -ForegroundColor Green
    Write-Host "  BTC: $btcBalance" -ForegroundColor White
    Write-Host "  ETH: $ethBalance" -ForegroundColor White
    Write-Host "  USDT: $usdtBalance" -ForegroundColor White
    
}
catch {
    Write-Host "Erro verificando saldos: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Verificar preco atual e calcular ordem pequena
Write-Host "`n2. Calculando ordem pequena..." -ForegroundColor Yellow
try {
    $price = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/price/BTCUSDT" -Method GET -TimeoutSec 5
    $currentPrice = [decimal]$price.price
    Write-Host "Preco BTCUSDT: $ $currentPrice" -ForegroundColor Cyan
    
    # Calcular ordem de $5 USD
    $targetUSD = 5
    $quantity = $targetUSD / $currentPrice
    Write-Host "Ordem de $ $targetUSD USD seria: $quantity BTC" -ForegroundColor White
    
    # Verificar se temos BTC suficiente
    $btcBalance = [decimal]$btcBalance
    if ($btcBalance -gt $quantity) {
        Write-Host "✅ Saldo suficiente para ordem de $ $targetUSD" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Saldo insuficiente. Temos: $btcBalance BTC, precisamos: $quantity BTC" -ForegroundColor Red
    }
    
}
catch {
    Write-Host "Erro calculando ordem: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Testar ordem manual muito pequena (0.00001 BTC = ~$1.11 USD)
Write-Host "`n3. Testando ordem manual pequena..." -ForegroundColor Yellow
try {
    Write-Host "Tentando ordem de 0.00001 BTC (aproximadamente $1 USD)..." -ForegroundColor Cyan
    
    $orderData = @{
        symbol   = "BTCUSDT"
        side     = "BUY"
        type     = "MARKET"
        quantity = "0.00001"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/order" -Method POST -Body $orderData -ContentType "application/json" -TimeoutSec 10
    
    Write-Host "✅ ORDEM EXECUTADA COM SUCESSO!" -ForegroundColor Green
    Write-Host "Detalhes: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor White
    
}
catch {
    Write-Host "❌ Ordem falhou: $($_.Exception.Message)" -ForegroundColor Red
    
    # Mostrar detalhes do erro
    if ($_.Exception.Response) {
        $errorBody = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorBody)
        $errorText = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorText" -ForegroundColor Red
    }
}

# 4. Se nao funcionou, tentar ordem de VENDA (usando BTC que temos)
Write-Host "`n4. Testando ordem de VENDA..." -ForegroundColor Yellow
try {
    Write-Host "Tentando vender 0.00001 BTC..." -ForegroundColor Cyan
    
    $sellOrder = @{
        symbol   = "BTCUSDT"
        side     = "SELL"
        type     = "MARKET"
        quantity = "0.00001"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/order" -Method POST -Body $sellOrder -ContentType "application/json" -TimeoutSec 10
    
    Write-Host "✅ ORDEM DE VENDA EXECUTADA!" -ForegroundColor Green
    Write-Host "Detalhes: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor White
    
}
catch {
    Write-Host "❌ Venda falhou: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Analise concluida!" -ForegroundColor Magenta


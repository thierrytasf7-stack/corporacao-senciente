Write-Host "TESTE SUCESSIVO ATE SUCESSO - ORDEM REAL" -ForegroundColor Green

# Funcao para testar ordem
function Test-Order {
    param($symbol, $side, $quantity)
    
    try {
        Write-Host "Testando: $side $quantity $symbol..." -ForegroundColor Cyan
        
        $orderData = @{
            symbol   = $symbol
            side     = $side
            type     = "MARKET"
            quantity = $quantity
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/order" -Method POST -Body $orderData -ContentType "application/json" -TimeoutSec 15
        
        Write-Host "SUCESSO! ORDEM EXECUTADA!" -ForegroundColor Green
        Write-Host "Detalhes: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor White
        return $true
        
    }
    catch {
        Write-Host "Falha: $($_.Exception.Message)" -ForegroundColor Red
        
        # Tentar extrair erro detalhado
        try {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorBody = $reader.ReadToEnd()
            if ($errorBody) {
                Write-Host "Erro detalhado: $errorBody" -ForegroundColor Yellow
            }
        }
        catch {
            # Ignorar erro de parsing
        }
        return $false
    }
}

Write-Host "TESTANDO DIFERENTES ESTRATEGIAS..." -ForegroundColor Magenta

# 1. Tentar com USDT primeiro (mais comum)
Write-Host "`n1. Testando compra com USDT..." -ForegroundColor Yellow
if (Test-Order "BTCUSDT" "BUY" "0.00001") {
    exit 0
}

# 2. Tentar quantidade maior
Write-Host "`n2. Testando quantidade maior..." -ForegroundColor Yellow
if (Test-Order "BTCUSDT" "BUY" "0.0001") {
    exit 0
}

# 3. Tentar venda de BTC
Write-Host "`n3. Testando venda de BTC..." -ForegroundColor Yellow
if (Test-Order "BTCUSDT" "SELL" "0.00001") {
    exit 0
}

# 4. Tentar outro par (ETH)
Write-Host "`n4. Testando ETH..." -ForegroundColor Yellow
if (Test-Order "ETHUSDT" "SELL" "0.001") {
    exit 0
}

# 5. Tentar SOL (temos bastante)
Write-Host "`n5. Testando SOL..." -ForegroundColor Yellow
if (Test-Order "SOLUSDT" "SELL" "0.1") {
    exit 0
}

# 6. Tentar ordem LIMIT em vez de MARKET
Write-Host "`n6. Testando ordem LIMIT..." -ForegroundColor Yellow
try {
    # Pegar preco atual
    $price = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/price/BTCUSDT" -Method GET -TimeoutSec 5
    $currentPrice = [decimal]$price.price
    $limitPrice = $currentPrice - 100  # Preco um pouco abaixo
    
    Write-Host "Preco atual: $currentPrice, Limite: $limitPrice" -ForegroundColor Cyan
    
    $orderData = @{
        symbol      = "BTCUSDT"
        side        = "BUY"
        type        = "LIMIT"
        quantity    = "0.00001"
        price       = $limitPrice.ToString()
        timeInForce = "GTC"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/order" -Method POST -Body $orderData -ContentType "application/json" -TimeoutSec 15
    
    Write-Host "SUCESSO! ORDEM LIMIT CRIADA!" -ForegroundColor Green
    Write-Host "Detalhes: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor White
    
}
catch {
    Write-Host "Ordem LIMIT falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Verificar info do simbolo
Write-Host "`n7. Verificando info do simbolo BTCUSDT..." -ForegroundColor Yellow
try {
    $symbolInfo = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/binance/exchange-info" -Method GET -TimeoutSec 10
    Write-Host "Info obtida com sucesso" -ForegroundColor Green
}
catch {
    Write-Host "Erro obtendo info: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Teste final com quantidade minima absoluta
Write-Host "`n8. Teste final - quantidade minima..." -ForegroundColor Yellow
$quantidades = @("0.000001", "0.00001", "0.0001", "0.001")
foreach ($qty in $quantidades) {
    Write-Host "Tentando $qty BTC..." -ForegroundColor Cyan
    if (Test-Order "BTCUSDT" "BUY" $qty) {
        Write-Host "SUCESSO COM QUANTIDADE: $qty" -ForegroundColor Green
        exit 0
    }
    Start-Sleep -Seconds 2
}

Write-Host "`nTodos os testes falharam. Verificando status do sistema..." -ForegroundColor Red

# Verificar se o sistema ainda está funcionando
try {
    $health = Invoke-RestMethod -Uri "http://localhost:13001/api/v1/health" -Method GET -TimeoutSec 5
    Write-Host "Sistema ainda funcionando: $($health.status)" -ForegroundColor Green
}
catch {
    Write-Host "Sistema com problemas: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAnalise de falhas concluida." -ForegroundColor Magenta


# Script para testar o sistema de matching
Write-Host "🔍 Verificando trades na Binance..." -ForegroundColor Cyan

try {
    $trades = Invoke-WebRequest -Uri "http://127.0.0.1:23231/api/v1/binance/trades?limit=10" -Method GET | Select-Object -ExpandProperty Content | ConvertFrom-Json | Select-Object -ExpandProperty trades
    
    Write-Host "`n📊 Trades encontrados:" -ForegroundColor Green
    $trades | ForEach-Object {
        $tipo = if ($_.isBuyer) { "COMPRA" } else { "VENDA " }
        Write-Host "  $tipo | ID: $($_.id) | Symbol: $($_.symbol) | Qty: $($_.qty) | Price: $($_.price)" -ForegroundColor $(if ($_.isBuyer) { "Green" } else { "Yellow" })
    }
    
    Write-Host "`n✅ Agora acesse o frontend em http://localhost:23230 e verifique o console do navegador" -ForegroundColor Cyan
    Write-Host "   Procure por logs começando com [BUILD ROWS] e [MATCHING]" -ForegroundColor White
    
}
catch {
    Write-Host "`n❌ Erro ao conectar com a API:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}


# Script para testar a lógica de matching
Write-Host "🔍 Testando lógica de matching..." -ForegroundColor Cyan

# Simular os dados que vêm da API
$compra = @{
    id       = "3874"
    symbol   = "BNBUSDT"
    quantity = 1.00000000
    price    = 1059.59000000
    isSold   = $false
}

$venda = @{
    id       = "3875"
    symbol   = "BNBUSDT"
    quantity = 1.00000000
    price    = 1059.55000000
}

Write-Host "`n📊 Dados de teste:" -ForegroundColor Green
Write-Host "  Compra: ID $($compra.id) | Qty: $($compra.quantity) | Price: $($compra.price)" -ForegroundColor Green
Write-Host "  Venda:  ID $($venda.id) | Qty: $($venda.quantity) | Price: $($venda.price)" -ForegroundColor Yellow

# Testar matching
$quantityDiff = [Math]::Abs($compra.quantity - $venda.quantity)
Write-Host "`n🔍 Teste de matching:" -ForegroundColor Cyan
Write-Host "  Diferença de quantidade: $quantityDiff" -ForegroundColor White
Write-Host "  Threshold (1e-12): 0.000000000001" -ForegroundColor White
Write-Host "  Match encontrado: $($quantityDiff -lt 1e-12)" -ForegroundColor $(if ($quantityDiff -lt 1e-12) { "Green" } else { "Red" })

if ($quantityDiff -lt 1e-12) {
    Write-Host "`n✅ MATCH DEVERIA FUNCIONAR!" -ForegroundColor Green
    Write-Host "  Compra ID: $($compra.id)" -ForegroundColor White
    Write-Host "  Venda ID: $($venda.id)" -ForegroundColor White
    Write-Host "  Quantidade: $($compra.quantity)" -ForegroundColor White
}
else {
    Write-Host "`n❌ MATCH NÃO DEVERIA FUNCIONAR!" -ForegroundColor Red
}

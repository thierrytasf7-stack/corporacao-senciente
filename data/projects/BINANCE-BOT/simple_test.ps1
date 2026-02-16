Write-Host "Testando API..." -ForegroundColor Yellow

$body = @{
    filename = "LOGS-CONSOLE-FRONTEND.JSON"
    content = '{"test": "data"}'
    timestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    sourceUrl = "http://localhost:13000/dashboard"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/logs/update-frontend" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Sucesso! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Resposta: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Detalhes: $($_.Exception.Response)" -ForegroundColor Red
}

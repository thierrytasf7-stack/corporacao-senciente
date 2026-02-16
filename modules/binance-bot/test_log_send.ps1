# Script para testar envio de logs ao backend
$logData = @{
    sessionId = "test_session_$(Get-Date -UFormat %s)"
    startTime = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    endTime = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    totalLogs = 10
    errors = 1
    warnings = 2
    logs = @(
        @{
            timestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
            level = "log"
            message = "Teste de log do PowerShell"
            url = "http://localhost:13000/dashboard"
        },
        @{
            timestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
            level = "error"
            message = "Erro de teste"
            url = "http://localhost:13000/dashboard"
        }
    )
    summary = @{
        errors = @()
        warnings = @()
        criticalErrors = @()
    }
    status = "Teste via PowerShell - $(Get-Date -Format 'HH:mm:ss')"
}

$payload = @{
    filename = "LOGS-CONSOLE-FRONTEND.JSON"
    content = ($logData | ConvertTo-Json -Depth 10)
    timestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    sourceUrl = "http://localhost:13000/dashboard"
}

Write-Host "Enviando log de teste..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/logs/update-frontend" -Method POST -Body ($payload | ConvertTo-Json -Depth 10) -ContentType "application/json"
    Write-Host "✅ Sucesso! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Resposta: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

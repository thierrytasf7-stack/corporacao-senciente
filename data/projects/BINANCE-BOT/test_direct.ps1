Write-Host "Testando atualização direta do arquivo..." -ForegroundColor Yellow

$testData = @{
    sessionId = "test_direct_$(Get-Date -UFormat %s)"
    startTime = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    endTime = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    totalLogs = 5
    errors = 1
    warnings = 2
    logs = @(
        @{
            timestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
            level = "log"
            message = "Teste direto via PowerShell"
            url = "http://localhost:13000/dashboard"
        },
        @{
            timestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
            level = "error"
            message = "Erro de teste direto"
            url = "http://localhost:13000/dashboard"
        }
    )
    summary = @{
        errors = @()
        warnings = @()
        criticalErrors = @()
    }
    status = "Teste direto - $(Get-Date -Format 'HH:mm:ss')"
}

try {
    $testData | ConvertTo-Json -Depth 10 | Set-Content "LOGS-CONSOLE-FRONTEND.JSON" -Encoding UTF8
    Write-Host "✅ Arquivo atualizado diretamente!" -ForegroundColor Green
    
    $content = Get-Content "LOGS-CONSOLE-FRONTEND.JSON" -Raw
    Write-Host "📄 Conteúdo atual:" -ForegroundColor Cyan
    Write-Host $content -ForegroundColor White
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

# Script PowerShell para atualizar LOGS-CONSOLE-FRONTEND.JSON automaticamente
# Sistema totalmente autônomo - sem interação do usuário

Write-Host "🤖 SISTEMA AUTOMÁTICO INICIADO" -ForegroundColor Green
Write-Host "📁 Arquivo: LOGS-CONSOLE-FRONTEND.JSON" -ForegroundColor Cyan
Write-Host "⏰ Intervalo: 5 segundos" -ForegroundColor Yellow
Write-Host "🔄 Modo: TOTALMENTE AUTÔNOMO" -ForegroundColor Magenta
Write-Host "=" * 60 -ForegroundColor Gray

$counter = 0

while ($true) {
    $counter++
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
    $timeDisplay = Get-Date -Format "HH:mm:ss"
    
    $data = @{
        sessionId = "auto_$(Get-Date -UFormat %s)_$counter"
        startTime = $timestamp
        endTime = $timestamp
        totalLogs = $counter * 5
        errors = [math]::Max(1, $counter % 3)
        warnings = [math]::Max(1, $counter % 2)
        logs = @(
            @{
                timestamp = $timestamp
                level = "log"
                message = "🚀 Sistema Automático - Atualização #$counter"
                url = "http://localhost:13000"
            },
            @{
                timestamp = $timestamp
                level = "info"
                message = "ℹ️ Informação automática - Ciclo $counter"
                url = "http://localhost:13000"
            },
            @{
                timestamp = $timestamp
                level = "warn"
                message = "⚠️ Aviso automático - Sistema funcionando"
                url = "http://localhost:13000"
            },
            @{
                timestamp = $timestamp
                level = "error"
                message = "❌ Erro simulado - Ciclo $counter"
                url = "http://localhost:13000"
            },
            @{
                timestamp = $timestamp
                level = "debug"
                message = "🐛 Debug automático - Operação $counter"
                url = "http://localhost:13000"
            }
        )
        summary = @{
            errors = @(
                @{
                    timestamp = $timestamp
                    level = "error"
                    message = "❌ Erro simulado - Ciclo $counter"
                    url = "http://localhost:13000"
                }
            )
            warnings = @(
                @{
                    timestamp = $timestamp
                    level = "warn"
                    message = "⚠️ Aviso automático - Sistema funcionando"
                    url = "http://localhost:13000"
                }
            )
            criticalErrors = @()
        }
        status = "Sistema automático ativo - Atualização #$counter - $timeDisplay"
    }
    
    try {
        $data | ConvertTo-Json -Depth 10 | Set-Content "LOGS-CONSOLE-FRONTEND.JSON" -Encoding UTF8
        Write-Host "✅ Atualização #$counter - $timeDisplay - Logs: $($data.totalLogs)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro na atualização #$counter : $_" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 5
}

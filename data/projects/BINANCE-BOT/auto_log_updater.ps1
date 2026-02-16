# Script para atualizar LOGS-CONSOLE-FRONTEND.JSON automaticamente
# Simula logs reais do frontend a cada 5 segundos

Write-Host "🤖 SISTEMA AUTOMÁTICO DE LOGS INICIADO" -ForegroundColor Green
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
        sessionId = "frontend_$(Get-Date -UFormat %s)_$counter"
        startTime = $timestamp
        endTime   = $timestamp
        totalLogs = $counter * 3
        errors    = [math]::Max(0, $counter % 5)
        warnings  = [math]::Max(0, $counter % 3)
        logs      = @(
            @{
                timestamp = $timestamp
                level     = "log"
                message   = "🚀 Frontend carregado - Dashboard ativo"
                url       = "http://localhost:13000/dashboard"
            },
            @{
                timestamp = $timestamp
                level     = "info"
                message   = "ℹ️ Componente Dashboard renderizado"
                url       = "http://localhost:13000/dashboard"
            },
            @{
                timestamp = $timestamp
                level     = "debug"
                message   = "🐛 Estado do Redux atualizado"
                url       = "http://localhost:13000/dashboard"
            }
        )
        summary   = @{
            errors         = @()
            warnings       = @()
            criticalErrors = @()
        }
        status    = "Frontend ativo - Atualização #$counter - $timeDisplay"
    }
    
    # Adicionar erros e warnings ocasionais
    if ($counter % 5 -eq 0) {
        $data.logs += @{
            timestamp = $timestamp
            level     = "error"
            message   = "❌ Erro de conexão com API"
            url       = "http://localhost:13000/dashboard"
        }
        $data.summary.errors += @{
            timestamp = $timestamp
            level     = "error"
            message   = "❌ Erro de conexão com API"
            url       = "http://localhost:13000/dashboard"
        }
    }
    
    if ($counter % 3 -eq 0) {
        $data.logs += @{
            timestamp = $timestamp
            level     = "warn"
            message   = "⚠️ Dados de mercado desatualizados"
            url       = "http://localhost:13000/dashboard"
        }
        $data.summary.warnings += @{
            timestamp = $timestamp
            level     = "warn"
            message   = "⚠️ Dados de mercado desatualizados"
            url       = "http://localhost:13000/dashboard"
        }
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

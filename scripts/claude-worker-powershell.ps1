# claude-worker-powershell.ps1 - Worker simples em PowerShell
param([string]$WorkerName = "trabalhador")

$ROOT = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"
$QUEUE_DIR = Join-Path $ROOT ".queue\$WorkerName"
$OUTPUT_DIR = Join-Path $ROOT ".output\$WorkerName"
$SESSION_FILE = Join-Path $ROOT ".session_$WorkerName.txt"

Write-Host "[WORKER-$WorkerName] Iniciando..."
Write-Host "[WORKER-$WorkerName] Queue: $QUEUE_DIR"
Write-Host "[WORKER-$WorkerName] Output: $OUTPUT_DIR"
Write-Host ""

# Criar diretórios
New-Item -ItemType Directory -Force -Path $QUEUE_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $OUTPUT_DIR | Out-Null

# Carregar session ID se existir
$sessionId = ""
if (Test-Path $SESSION_FILE) {
    $sessionId = (Get-Content $SESSION_FILE -Raw).Trim()
    Write-Host "[WORKER-$WorkerName] Session: $sessionId"
}

$taskCount = 0

while ($true) {
    # Buscar próximo prompt (FIFO)
    $prompts = Get-ChildItem -Path $QUEUE_DIR -Filter "*.prompt" -File | Sort-Object Name

    if ($prompts.Count -gt 0) {
        $taskCount++
        $promptFile = $prompts[0]

        Write-Host "[WORKER-$WorkerName] TASK #$taskCount`: $($promptFile.Name)"

        # Executar Claude via PowerShell isolado
        if ($sessionId) {
            $result = & powershell.exe -NoProfile -File "workers\claude-wrapper\run-claude.ps1" `
                -PromptFile $promptFile.FullName `
                -SessionId $sessionId `
                2>&1 | Out-String
        } else {
            $result = & powershell.exe -NoProfile -File "workers\claude-wrapper\run-claude.ps1" `
                -PromptFile $promptFile.FullName `
                2>&1 | Out-String
        }

        # Extrair session ID se houver
        if ($result -match "session_id:\s*([a-f0-9\-]+)") {
            $sessionId = $Matches[1]
            Set-Content -Path $SESSION_FILE -Value $sessionId -NoNewline
            Write-Host "[WORKER-$WorkerName] Session salva: $sessionId"
        }

        # Salvar output
        $outputFile = Join-Path $OUTPUT_DIR "task_$taskCount.txt"
        Set-Content -Path $outputFile -Value $result -Encoding UTF8

        # Atualizar latest
        Copy-Item $outputFile -Destination (Join-Path $OUTPUT_DIR "latest.txt")

        Write-Host "[WORKER-$WorkerName] TASK #$taskCount CONCLUIDA ($($result.Length) bytes)"
        Write-Host ""

        # Remover prompt processado
        Remove-Item $promptFile.FullName
    }

    Start-Sleep -Seconds 1
}

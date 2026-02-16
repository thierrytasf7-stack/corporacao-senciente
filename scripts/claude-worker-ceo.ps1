# claude-worker-ceo.ps1 - Worker que invoca CEO-ZERO em loop
param([string]$WorkerName = "trabalhador")

$ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $ROOT

$QUEUE_DIR = Join-Path $ROOT ".queue\$WorkerName"
$OUTPUT_DIR = Join-Path $ROOT ".output\$WorkerName"

# Create dirs
New-Item -ItemType Directory -Path $QUEUE_DIR -Force | Out-Null
New-Item -ItemType Directory -Path $OUTPUT_DIR -Force | Out-Null

# Set git-bash path (REQUIRED)
$env:CLAUDE_CODE_GIT_BASH_PATH = "D:\Git\usr\bin\bash.exe"

# Remove session vars
Remove-Item Env:CLAUDECODE* -ErrorAction SilentlyContinue
Remove-Item Env:CLAUDE_CODE_SESSION* -ErrorAction SilentlyContinue

$taskCount = 0

Write-Host "[CEO-WORKER-$WorkerName] Iniciado"
Write-Host "[CEO-WORKER-$WorkerName] Queue: $QUEUE_DIR"
Write-Host "[CEO-WORKER-$WorkerName] Output: $OUTPUT_DIR"
Write-Host ""

while ($true) {
    $prompts = Get-ChildItem "$QUEUE_DIR\*.prompt" -ErrorAction SilentlyContinue | Sort-Object Name

    if ($prompts.Count -gt 0) {
        $taskCount++
        $promptFile = $prompts[0]

        Write-Host "[CEO-WORKER-$WorkerName] TASK #$taskCount : $($promptFile.Name)"

        $prompt = Get-Content $promptFile.FullName -Raw -Encoding UTF8
        $ceoInvocation = "/CEOs:CEO-ZERO $prompt"

        $outputFile = Join-Path $OUTPUT_DIR "task_$taskCount.txt"

        try {
            # Invoke Claude CLI with CEO-ZERO
            $output = & "$env:USERPROFILE\.local\bin\claude.exe" `
                --dangerously-skip-permissions `
                --model claude-haiku-4-5-20251001 `
                --print `
                $ceoInvocation 2>&1

            # Save output
            $output | Out-File -FilePath $outputFile -Encoding UTF8 -Force

            # Update latest
            $output | Out-File -FilePath (Join-Path $OUTPUT_DIR "latest.txt") -Encoding UTF8 -Force

            Write-Host "[CEO-WORKER-$WorkerName] TASK #$taskCount CONCLUIDA ($($output.Length) bytes)"

            # Mark done
            "" | Out-File -FilePath (Join-Path $OUTPUT_DIR "task_$taskCount.done") -Encoding UTF8

            # Remove prompt
            Remove-Item $promptFile.FullName -Force
        }
        catch {
            Write-Host "[CEO-WORKER-$WorkerName] ERRO: $_" -ForegroundColor Red
            Start-Sleep -Seconds 5
        }
    }
    else {
        Start-Sleep -Seconds 1
    }
}

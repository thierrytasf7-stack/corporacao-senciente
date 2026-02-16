# AIOS PM-Observer v1.1.3 - Perfectly Braced
$SCRIPT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_ROOT
Set-Location $PROJECT_ROOT

$STORY_DIR = "docs/stories"
$POLLING_INTERVAL = 180

Write-Host "🕵️‍♂️ OBSERVADOR AVANÇADO ONLINE" -ForegroundColor Yellow

while ($true) {
    try {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Iniciando ciclo de harmonização..." -ForegroundColor Gray
        
        $msg = "ACT AS PM/PO HARMONIZER: 1. Scan all .md files in docs/stories. 2. If status is ERROR: Rewrite ## Aider Prompt to fix the reported error and set status to TODO. 3. If status is DONE: Generate the NEXT logical story. 4. For all TODO stories: Ensure they have Dificuldade, Squad Responsável and Squad Repository."

        aider --model openrouter/arcee-ai/trinity-large-preview:free --no-auto-commits --yes --message "$msg"

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Ciclo concluído." -ForegroundColor Green
        } else {
            Write-Host "❌ Erro na execução do Aider." -ForegroundColor Red
        }
    } catch {
        Write-Host "🔥 Error: $($_.Exception.Message)"
    }
    Start-Sleep -Seconds $POLLING_INTERVAL
}

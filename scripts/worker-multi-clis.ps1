# worker-multi-clis.ps1
# Worker que monitora .queue/{WorkerName}/*.prompt e invoca MULTI-CLIS em modo auto
# Para alterar a CLI engine: editar CLI_DEFAULT no inicio de MULTI-CLIS.bat
param([string]$WorkerName = "trabalhador")

$ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $ROOT

$QUEUE_DIR  = Join-Path $ROOT ".queue\$WorkerName"
$OUTPUT_DIR = Join-Path $ROOT ".output\$WorkerName"
$MULTICLIS  = Join-Path $ROOT "MULTI-CLIS.bat"

New-Item -ItemType Directory -Path $QUEUE_DIR  -Force | Out-Null
New-Item -ItemType Directory -Path $OUTPUT_DIR -Force | Out-Null

# ================================================================
# ROTEAMENTO TRABALHADOR: story type → agente AIOS
# Para adicionar novos mapeamentos, edite a hashtable abaixo.
# ================================================================
$ROUTING = @{
    # [prefixo do filename] = [caminho relativo ao .claude\commands]
    'security'    = 'Desenvolvimento\Security-AIOS.md'
    'performance' = 'Desenvolvimento\Performance-AIOS.md'
    'optimization'= 'Desenvolvimento\Performance-AIOS.md'
    'refactor'    = 'Desenvolvimento\Dev-AIOS.md'
    'feature'     = 'Desenvolvimento\Dev-AIOS.md'
    'senciencia'  = 'Desenvolvimento\Dev-AIOS.md'
    'epic'        = 'Desenvolvimento\Dev-AIOS.md'
    'data'        = 'Desenvolvimento\DataEngineer-AIOS.md'
    'schema'      = 'Desenvolvimento\DataEngineer-AIOS.md'
    'migration'   = 'Desenvolvimento\DataEngineer-AIOS.md'
    'docs'        = 'Desenvolvimento\DocsGenerator-AIOS.md'
    'qa'          = 'Desenvolvimento\QA-AIOS.md'
    'test'        = 'Desenvolvimento\QA-AIOS.md'
}
$DEFAULT_AGENT = 'Desenvolvimento\Dev-AIOS.md'

function Get-AgentForTask {
    param([string]$PromptContent)

    # Extrair nome do arquivo de story do prompt (linha "STORY: filename.md")
    $storyLine = ($PromptContent -split "`n" | Where-Object { $_ -match '^STORY:' } | Select-Object -First 1)
    $storyFile = ''
    if ($storyLine) {
        $storyFile = ($storyLine -replace '^STORY:\s*', '').Trim().ToLower()
    }

    # Verificar tambem linha PATH: para o caminho completo
    if (-not $storyFile) {
        $pathLine = ($PromptContent -split "`n" | Where-Object { $_ -match '^PATH:' } | Select-Object -First 1)
        if ($pathLine) {
            $storyFile = [System.IO.Path]::GetFileName(($pathLine -replace '^PATH:\s*', '').Trim()).ToLower()
        }
    }

    # Verificar tags de agente no conteudo (@dev, @security, etc.)
    if ($PromptContent -match '@security')        { return 'Desenvolvimento\Security-AIOS.md' }
    if ($PromptContent -match '@performance')     { return 'Desenvolvimento\Performance-AIOS.md' }
    if ($PromptContent -match '@data-engineer')   { return 'Desenvolvimento\DataEngineer-AIOS.md' }
    if ($PromptContent -match '@docs')            { return 'Desenvolvimento\DocsGenerator-AIOS.md' }
    if ($PromptContent -match '@qa')              { return 'Desenvolvimento\QA-AIOS.md' }

    # Rotear pelo prefixo do filename
    foreach ($prefix in $ROUTING.Keys) {
        if ($storyFile.StartsWith($prefix)) {
            return $ROUTING[$prefix]
        }
    }

    return $DEFAULT_AGENT
}

# ================================================================

$taskCount = 0

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  WORKER-MULTI-CLIS: $($WorkerName.ToUpper())" -ForegroundColor Cyan
Write-Host "  Queue : $QUEUE_DIR" -ForegroundColor Gray
Write-Host "  Engine: ver CLI_DEFAULT em MULTI-CLIS.bat" -ForegroundColor Gray
if ($WorkerName -eq 'trabalhador') {
    Write-Host "  Routing: automatico por tipo de story" -ForegroundColor Gray
}
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Aguardando prompts em .queue\$WorkerName\..." -ForegroundColor Yellow

while ($true) {
    $prompts = Get-ChildItem "$QUEUE_DIR\*.prompt" -ErrorAction SilentlyContinue | Sort-Object Name

    if ($prompts.Count -gt 0) {
        $taskCount++
        $promptFile = $prompts[0]
        $prompt = Get-Content $promptFile.FullName -Raw -Encoding UTF8

        Write-Host ""
        Write-Host "[$WorkerName] TASK #$taskCount : $($promptFile.Name)" -ForegroundColor Green

        # Determinar agente
        $agentArg = ''
        if ($WorkerName -eq 'trabalhador') {
            $resolvedAgent = Get-AgentForTask -PromptContent $prompt
            $agentArg = $resolvedAgent
            Write-Host "[$WorkerName] Agente: $resolvedAgent" -ForegroundColor Cyan
        }

        Write-Host "[$WorkerName] Invocando MULTI-CLIS..." -ForegroundColor Yellow

        # Invocar MULTI-CLIS em modo auto
        if ($agentArg) {
            & cmd.exe /c "`"$MULTICLIS`" --worker `"$WorkerName`" `"$($promptFile.FullName)`" `"$agentArg`""
        } else {
            & cmd.exe /c "`"$MULTICLIS`" --worker `"$WorkerName`" `"$($promptFile.FullName)`""
        }

        # Registrar conclusao
        $doneFile = Join-Path $OUTPUT_DIR "task_$taskCount.done"
        "Task #$taskCount | $($promptFile.Name) | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" |
            Out-File -FilePath $doneFile -Encoding UTF8 -Force

        "Task #$taskCount ($($promptFile.Name)) - $(Get-Date -Format 'HH:mm:ss')" |
            Out-File -FilePath (Join-Path $OUTPUT_DIR "latest.txt") -Encoding UTF8 -Force

        Remove-Item $promptFile.FullName -Force

        Write-Host "[$WorkerName] TASK #$taskCount concluida. Aguardando proxima..." -ForegroundColor Cyan
    }
    else {
        Start-Sleep -Seconds 1
    }
}

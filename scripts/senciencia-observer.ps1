$SCRIPT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_ROOT
Set-Location $PROJECT_ROOT

$DNA_PATH = \"data/memory/levels.json\"
$STORY_DIR = \"docs/stories\"
$STAGES_DIR = \"docs/reports/METRICAS_DIRECAO_EVOLUCAO/TASKS-144-ETAPAS\"
$POLLING_INTERVAL = 60

Write-Host \"?? SENCIÊNCIA-OBSERVADOR ONLINE\" -ForegroundColor Magenta
Write-Host \"?? Root: $PROJECT_ROOT\" -ForegroundColor Gray

function Get-SystemDNA { return Get-Content $DNA_PATH | ConvertFrom-Json }
function Save-SystemDNA($dna) { $dna | ConvertTo-Json -Depth 10 | Set-Content $DNA_PATH }

function Check-ActiveTasks {
    if (-not (Test-Path $STORY_DIR)) { return `$false }
    `$active = Get-ChildItem -Path `$STORY_DIR -Filter \"*.md\" -Recurse | ForEach-Object {
        `$content = Get-Content `$_.FullName -Raw
        if (`$content -match \"Status: (TODO|IN_PROGRESS|AI_REVIEW|PR_CREATED)\") { return `$true }
    }
    return `$active -contains `$true
}

function Trigger-Stage-Evolution($dna) {
    `$nextStage = `$dna.global_stage + 1
    `$stageFile = Join-Path `$STAGES_DIR \"ETAPA_$( `$nextStage.ToString('000') ).md\"
    
    if (Test-Path `$stageFile) {
        Write-Host \"?? EVOLUÇÃO GLOBAL DETECTADA! Iniciando ETAPA `$nextStage\" -ForegroundColor Gold
        aider --model openrouter/arcee-ai/trinity-large-preview:free --no-auto-commits --yes --message \"ACT AS ARCHITECT: Extract all tasks from `$stageFile and create individual .md stories in `$STORY_DIR following the story-template.md. Set status to TODO.\"
        
        `$dna.global_stage = `$nextStage
        return `$true
    }
    return `$false
}

function Condensate-System($dna) {
    Write-Host \"?? CICLO DE CONDENSAÇÃO INICIADO...\" -ForegroundColor Blue
    aider --model openrouter/arcee-ai/trinity-large-preview:free --no-auto-commits --yes --message \"ACT AS SYSTEM ANALYST: 1. Review all DONE stories in `$STORY_DIR. 2. Generate a 'Progress & Reflection Report' in docs/reports/reflections. 3. Suggest 3 micro-improvements for the next level.\"
    `$dna.evolution_count = 0
    `$dna.last_condensation = Get-Date -Format \"yyyy-MM-dd\"
}

while (`$true) {
    `$dna = Get-SystemDNA
    if (-not (Check-ActiveTasks)) {
        Write-Host \"?? Sistema Ocioso. Analisando Harmonia Evolutiva...\" -ForegroundColor Green
        
        `$levels = `$dna.levels.PSObject.Properties
        `$minLevel = (`$levels | Measure-Object -Property Value -Minimum).Minimum
        `$weakSectors = `$levels | Where-Object { `$_.Value -eq `$minLevel }
        
        `$maxLevel = (`$levels | Measure-Object -Property Value -Maximum).Maximum
        if (`$minLevel -eq `$maxLevel) {
            if (-not (Trigger-Stage-Evolution `$dna)) {
                `$sector = `$levels | Select-Object -First 1
                Write-Host \"?? Evoluindo Setor: `$(`$sector.Name) para LV `$(`$sector.Value + 1)\" -ForegroundColor Cyan
                aider --model openrouter/arcee-ai/trinity-large-preview:free --no-auto-commits --yes --message \"ACT AS HARMONIZER: Create a micro-task to evolve `$(`$sector.Name) to level `$(`$minLevel + 1). This is required to maintain system balance.\"
            }
        } else {
            `$target = `$weakSectors | Select-Object -First 1
            Write-Host \"?? Equilibrando Harmonia: `$(`$target.Name) (LV `$minLevel -> `$(`$minLevel + 1))\" -ForegroundColor Yellow
            aider --model openrouter/arcee-ai/trinity-large-preview:free --no-auto-commits --yes --message \"ACT AS HARMONIZER: Create a micro-task to evolve `$(`$target.Name) to level `$(`$minLevel + 1). This is required to maintain system balance.\"
        }

        `$dna.evolution_count++
        if (`$dna.evolution_count -ge 5) { Condensate-System `$dna }
        Save-SystemDNA `$dna
    }
    Start-Sleep -Seconds `$POLLING_INTERVAL
}
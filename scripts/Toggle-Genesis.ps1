# Toggle-Genesis.ps1 - Master Switch for Sentient Evolution

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("ON", "OFF")]
    [string]$State
)

$projectRoot = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
$storyFile = Join-Path $projectRoot "docs/stories/activate_genesis_observer.md"
$envFile = Join-Path $projectRoot "config/environment-config.json"

Write-Host "🧬 GENESIS CONTROL PROTOCOL: $State" -ForegroundColor Magenta

# Load Config
$json = Get-Content $envFile | ConvertFrom-Json

if ($State -eq "OFF") {
    # 1. Set Env Var to block regeneration
    if (-not $json.global_vars.PSObject.Properties["NO_GENESIS"]) {
        $json.global_vars | Add-Member -MemberType NoteProperty -Name "NO_GENESIS" -Value "true"
    } else {
        $json.global_vars.NO_GENESIS = "true"
    }
    
    # 2. Rename the story to stop current execution
    if (Test-Path $storyFile) {
        Move-Item $storyFile "$storyFile.disabled" -Force
        Write-Host "   -> Genesis Story disabled." -ForegroundColor Yellow
    }
    
    Write-Host "⛔ Genesis deactivated." -ForegroundColor Red
}
elseif ($State -eq "ON") {
    # 1. Remove Env Var logic (Set to false or remove)
    if ($json.global_vars.PSObject.Properties["NO_GENESIS"]) {
        $json.global_vars.PSObject.Properties.Remove("NO_GENESIS")
    }
    
    # 2. Restore/Create Story
    if (Test-Path "$storyFile.disabled") {
        Move-Item "$storyFile.disabled" $storyFile -Force
        Write-Host "   -> Genesis Story restored." -ForegroundColor Green
    } elseif (-not (Test-Path $storyFile)) {
        # Create it fresh
        $content = "# Story: Ativar Genesis Observer`nStatus: TODO`nsubStatus: pending_worker`nRevisions: 0`n`n## Contexto`n[EVOLUÇÃO] Gatilho automático.`n`n## Aider Prompt`n> ```text`n> EXECUTE_COMMAND: node tools/agents/squads/genesis-observer/scripts/genesis-brain.js`n> ```"
        $content | Set-Content $storyFile -Encoding UTF8
        Write-Host "   -> Genesis Story created." -ForegroundColor Green
    }
    
    Write-Host "✅ Genesis ACTIVATED." -ForegroundColor Green
}

# Save Config
$json | ConvertTo-Json -Depth 10 | Set-Content $envFile -Encoding UTF8

Write-Host "⚠️  IMPORTANT: Restart Visible Squad to apply changes!" -ForegroundColor Yellow

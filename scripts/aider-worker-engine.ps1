param([string]$WorkerId)

$PROJECT_ROOT = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
Set-Location $PROJECT_ROOT
$STORY_DIR = "docs/stories"

Write-Host "[*] Motor Aider: Vigilante..." -ForegroundColor Gray

# Pega o primeiro arquivo que tenha ambas as strings
$targetFile = Get-ChildItem -Path $STORY_DIR -Filter "*.md" | 
              Select-String -Pattern "@aider" | 
              Select-String -Pattern "Status: TODO" | 
              Select-Object -First 1 -ExpandProperty Path

if ($targetFile) {
    $filename = Split-Path $targetFile -Leaf
    Write-Host "[!] Task Identificada: $filename" -ForegroundColor Cyan
    
    Write-Host ">>> ATUALIZANDO STATUS PARA REVISION..." -ForegroundColor Green
    $content = Get-Content $targetFile -Raw
    $newContent = $content -replace "Status:.*", "Status: REVISION"
    $newContent = $newContent -replace "subStatus:.*", "subStatus: ready_for_revision"
    $newContent | Set-Content $targetFile -Force
    
    Write-Host ">>> SUCESSO." -ForegroundColor Green
} else {
    Write-Host "[*] Nenhuma task correspondente encontrada." -ForegroundColor Gray
}
Exit 0

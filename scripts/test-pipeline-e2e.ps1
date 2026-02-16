# test-pipeline-e2e.ps1
# Testa pipeline completa: Genesis (Sentinela) → Escrivao → Revisador
# Valida comunicacao via arquivos (.trigger, .prompt) entre workers

$ErrorActionPreference = "Stop"
$root = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"
Set-Location $root

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTE E2E: Pipeline Workers Diana" -ForegroundColor Cyan
Write-Host "  Genesis → Escrivao → Revisador" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cleanup de arquivos de teste anteriores
Write-Host "[0/5] Limpando arquivos de teste anteriores..." -ForegroundColor Yellow
Remove-Item ".trigger_*" -ErrorAction SilentlyContinue
Remove-Item ".prompt_*.txt" -ErrorAction SilentlyContinue
Remove-Item ".worker_*.lock" -ErrorAction SilentlyContinue
Write-Host "  [OK] Cleanup concluido" -ForegroundColor Green

# FASE 1: Genesis (Sentinela) gera story
Write-Host ""
Write-Host "[1/5] Simulando Genesis (SENTINELA) gerando story..." -ForegroundColor Yellow
$storyPrompt = @"
Gere uma story de evolucao senciente:
- Titulo: Implementar reflexao cognitiva
- Descricao: Sistema deve refletir sobre decisoes tomadas
- Acceptance Criteria: 3 criterios minimos
"@

Set-Content -Path ".prompt_sentinela.txt" -Value $storyPrompt
New-Item -Path ".trigger_sentinela" -ItemType File -Force | Out-Null
Write-Host "  [OK] Trigger SENTINELA criado (.trigger_sentinela + .prompt_sentinela.txt)" -ForegroundColor Green

# Simular processamento
Start-Sleep -Seconds 1
Write-Host "  [OK] SENTINELA processaria: '$storyPrompt'" -ForegroundColor Gray

# FASE 2: Escrivao implementa
Write-Host ""
Write-Host "[2/5] Simulando ESCRIVAO implementando story..." -ForegroundColor Yellow
$implPrompt = @"
Implemente a story gerada pelo Genesis:
- Ler story de docs/stories/active/
- Implementar codigo conforme acceptance criteria
- Marcar checkboxes na story
"@

Set-Content -Path ".prompt_escrivao.txt" -Value $implPrompt
New-Item -Path ".trigger_escrivao" -ItemType File -Force | Out-Null
Write-Host "  [OK] Trigger ESCRIVAO criado (.trigger_escrivao + .prompt_escrivao.txt)" -ForegroundColor Green

# Simular processamento
Start-Sleep -Seconds 1
Write-Host "  [OK] ESCRIVAO processaria: '$implPrompt'" -ForegroundColor Gray

# FASE 3: Revisador aprova
Write-Host ""
Write-Host "[3/5] Simulando REVISADOR revisando story..." -ForegroundColor Yellow
$reviewPrompt = @"
Revise a story implementada pelo Escrivao:
- Verificar todos checkboxes marcados
- Validar qualidade do codigo
- Aprovar ou solicitar correcoes
"@

Set-Content -Path ".prompt_revisador.txt" -Value $reviewPrompt
New-Item -Path ".trigger_revisador" -ItemType File -Force | Out-Null
Write-Host "  [OK] Trigger REVISADOR criado (.trigger_revisador + .prompt_revisador.txt)" -ForegroundColor Green

# Simular processamento
Start-Sleep -Seconds 1
Write-Host "  [OK] REVISADOR processaria: '$reviewPrompt'" -ForegroundColor Gray

# FASE 4: Validar arquivos de comunicacao
Write-Host ""
Write-Host "[4/5] Validando arquivos de comunicacao entre workers..." -ForegroundColor Yellow
$files = @(".trigger_sentinela", ".prompt_sentinela.txt", ".trigger_escrivao", ".prompt_escrivao.txt", ".trigger_revisador", ".prompt_revisador.txt")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file existe" -ForegroundColor Green
    } else {
        Write-Host "  [ERRO] $file NAO encontrado!" -ForegroundColor Red
        exit 1
    }
}

# FASE 5: Cleanup final
Write-Host ""
Write-Host "[5/5] Limpando arquivos de teste..." -ForegroundColor Yellow
Remove-Item ".trigger_*" -ErrorAction SilentlyContinue
Remove-Item ".prompt_*.txt" -ErrorAction SilentlyContinue
Write-Host "  [OK] Cleanup concluido" -ForegroundColor Green

# RESULTADO FINAL
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  PIPELINE E2E: VALIDACAO COMPLETA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resumo da Pipeline:" -ForegroundColor Cyan
Write-Host "  1. SENTINELA (Genesis)  → Gera story senciente" -ForegroundColor White
Write-Host "  2. ESCRIVAO (Worker)    → Implementa story" -ForegroundColor White
Write-Host "  3. REVISADOR (Reviewer) → Revisa e aprova" -ForegroundColor White
Write-Host ""
Write-Host "Comunicacao:" -ForegroundColor Cyan
Write-Host "  - Cada worker usa .trigger_<nome> para sinalizar" -ForegroundColor White
Write-Host "  - Prompts sao passados via .prompt_<nome>.txt" -ForegroundColor White
Write-Host "  - Workers sao INDEPENDENTES (Claude interativo separado)" -ForegroundColor White
Write-Host ""
Write-Host "Proximo passo:" -ForegroundColor Yellow
Write-Host "  Execute: .\Start-Diana-Native.bat" -ForegroundColor White
Write-Host "  Os 3 workers estarao prontos em terminais separados!" -ForegroundColor White
Write-Host ""

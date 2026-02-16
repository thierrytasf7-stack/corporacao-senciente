# ==============================================================================
# CORPORACAO SENCIENTE - Build and Push Maestro Image (Autônomo)
# Versão autônoma que tenta descobrir informações automaticamente
# ==============================================================================

Write-Host "=== CORPORACAO SENCIENTE - Build and Push Maestro (Autônomo) ===" -ForegroundColor Cyan
Write-Host ""

# Tentar descobrir informações do Git
$gitRemote = git config --get remote.origin.url 2>$null
$githubUser = $null
$repoName = $null

if ($gitRemote) {
    Write-Host "Detectando informações do repositório Git..." -ForegroundColor Cyan
    
    # Tentar extrair usuário e repo de diferentes formatos
    if ($gitRemote -match "github.com[:/]([^/]+)/([^/\.]+)") {
        $githubUser = $matches[1]
        $repoName = $matches[2] -replace '\.git$', ''
        Write-Host "  Usuário GitHub: $githubUser" -ForegroundColor Green
        Write-Host "  Repositório: $repoName" -ForegroundColor Green
    }
}

# Se não conseguiu detectar, usar valores padrão ou solicitar
if (-not $githubUser -or -not $repoName) {
    Write-Host "Não foi possível detectar automaticamente. Usando valores padrão..." -ForegroundColor Yellow
    $githubUser = "thierytasf"  # Ajustar se necessário
    $repoName = "Diana-Corporacao-Senciente"  # Ajustar se necessário
    Write-Host "  Usuário GitHub: $githubUser" -ForegroundColor Yellow
    Write-Host "  Repositório: $repoName" -ForegroundColor Yellow
}

$imageName = "ghcr.io/${githubUser}/${repoName}-maestro"
$imageTag = "latest"

Write-Host ""
Write-Host "Configuração:" -ForegroundColor Cyan
Write-Host "  Imagem: ${imageName}:${imageTag}"
Write-Host ""

# Verificar Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Docker não encontrado" -ForegroundColor Red
    exit 1
}

# Verificar se já está logado no GitHub Container Registry
Write-Host "Verificando login no GitHub Container Registry..." -ForegroundColor Cyan

$githubToken = $env:GITHUB_TOKEN
if ([string]::IsNullOrWhiteSpace($githubToken)) {
    Write-Host "Token GitHub não encontrado na variável GITHUB_TOKEN" -ForegroundColor Yellow
    Write-Host "Tentando verificar se já está logado..." -ForegroundColor Yellow
    
    # Verificar se já está logado
    $loginCheck = docker info 2>&1 | Select-String "ghcr.io"
    if (-not $loginCheck) {
        Write-Host ""
        Write-Host "⚠️  Você precisa fazer login no GitHub Container Registry" -ForegroundColor Yellow
        Write-Host "Opções:" -ForegroundColor Cyan
        Write-Host "1. Criar um Personal Access Token em: https://github.com/settings/tokens" -ForegroundColor White
        Write-Host "2. Definir variável: `$env:GITHUB_TOKEN = 'seu-token'" -ForegroundColor White
        Write-Host "3. Ou executar: echo 'seu-token' | docker login ghcr.io -u $githubUser --password-stdin" -ForegroundColor White
        Write-Host ""
        Write-Host "Pressione Enter para continuar (tentará build mesmo assim)..." -ForegroundColor Yellow
        Read-Host
    }
} else {
    Write-Host "Token encontrado, fazendo login..." -ForegroundColor Green
    $githubToken | docker login ghcr.io -u $githubUser --password-stdin 2>&1 | Out-Null
}

# Navegar para pasta do maestro
$maestroPath = Join-Path $PSScriptRoot "maestro"
if (-not (Test-Path $maestroPath)) {
    Write-Host "ERRO: Pasta maestro não encontrada em: $maestroPath" -ForegroundColor Red
    exit 1
}

Set-Location $maestroPath

# Build da imagem
Write-Host ""
Write-Host "Fazendo build da imagem..." -ForegroundColor Cyan
Write-Host "  Contexto: $maestroPath" -ForegroundColor Gray
Write-Host "  Imagem: ${imageName}:${imageTag}" -ForegroundColor Gray
Write-Host ""

docker build -t "${imageName}:${imageTag}" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha no build" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Build concluído com sucesso!" -ForegroundColor Green

# Push da imagem
Write-Host ""
Write-Host "Fazendo push da imagem..." -ForegroundColor Cyan
Write-Host "  Registry: ghcr.io" -ForegroundColor Gray
Write-Host "  Imagem: ${imageName}:${imageTag}" -ForegroundColor Gray
Write-Host ""

docker push "${imageName}:${imageTag}"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERRO: Falha no push" -ForegroundColor Red
    Write-Host "Possíveis causas:" -ForegroundColor Yellow
    Write-Host "  1. Não está logado no GitHub Container Registry" -ForegroundColor White
    Write-Host "  2. Token não tem permissão 'write:packages'" -ForegroundColor White
    Write-Host "  3. Imagem já existe e precisa de autenticação" -ForegroundColor White
    Write-Host ""
    Write-Host "Solução: Execute o login manualmente:" -ForegroundColor Cyan
    Write-Host "  echo 'SEU_TOKEN' | docker login ghcr.io -u $githubUser --password-stdin" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "=== Build e Push Completo! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Imagem disponível em:" -ForegroundColor Cyan
Write-Host "  ${imageName}:${imageTag}" -ForegroundColor White
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. No Portainer, use o arquivo docker-compose.production.yml" -ForegroundColor White
Write-Host "2. Altere a linha do image do maestro para:" -ForegroundColor White
Write-Host "   image: ${imageName}:${imageTag}" -ForegroundColor Yellow
Write-Host "3. Deploy a stack" -ForegroundColor White
Write-Host ""

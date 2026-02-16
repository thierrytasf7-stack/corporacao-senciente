# ==============================================================================
# CORPORACAO SENCIENTE - Build and Push Maestro Image (PowerShell)
# Script para fazer build local e push para GitHub Container Registry
# ==============================================================================

Write-Host "=== CORPORACAO SENCIENTE - Build and Push Maestro ===" -ForegroundColor Cyan
Write-Host ""

# Solicitar informações
$githubUser = Read-Host "Digite seu usuário do GitHub"
$repoName = Read-Host "Digite o nome do repositório (ex: diana-corporacao-senciente)"

if ([string]::IsNullOrWhiteSpace($githubUser) -or [string]::IsNullOrWhiteSpace($repoName)) {
    Write-Host "ERRO: Usuário e repositório são obrigatórios" -ForegroundColor Red
    exit 1
}

$imageName = "ghcr.io/${githubUser}/${repoName}-maestro"
$imageTag = "latest"

Write-Host ""
Write-Host "Configuração:" -ForegroundColor Cyan
Write-Host "  Imagem: ${imageName}:${imageTag}"
Write-Host ""

# Verificar se está logado no GitHub Container Registry
Write-Host "Verificando login no GitHub Container Registry..." -ForegroundColor Cyan

$githubToken = $env:GITHUB_TOKEN
if ([string]::IsNullOrWhiteSpace($githubToken)) {
    Write-Host "Você precisa fazer login no GitHub Container Registry" -ForegroundColor Yellow
    Write-Host "Crie um Personal Access Token (PAT) com permissão 'write:packages'"
    Write-Host "Em: https://github.com/settings/tokens"
    Write-Host ""
    $githubToken = Read-Host "Digite seu GitHub Personal Access Token" -AsSecureString
    $githubTokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($githubToken)
    )
} else {
    $githubTokenPlain = $githubToken
}

# Login no Docker
$githubTokenPlain | docker login ghcr.io -u $githubUser --password-stdin
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha no login" -ForegroundColor Red
    exit 1
}

# Navegar para pasta do maestro
if (-not (Test-Path "maestro")) {
    Write-Host "ERRO: Pasta maestro não encontrada" -ForegroundColor Red
    exit 1
}

Set-Location maestro

# Build da imagem
Write-Host ""
Write-Host "Fazendo build da imagem..." -ForegroundColor Cyan
docker build -t "${imageName}:${imageTag}" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha no build" -ForegroundColor Red
    exit 1
}

# Push da imagem
Write-Host ""
Write-Host "Fazendo push da imagem..." -ForegroundColor Cyan
docker push "${imageName}:${imageTag}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha no push" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Build e Push Completo! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. No Portainer, use o arquivo docker-compose.production.yml"
Write-Host "2. Altere a linha do image do maestro para:"
Write-Host "   image: ${imageName}:${imageTag}"
Write-Host "3. Deploy a stack"
Write-Host ""

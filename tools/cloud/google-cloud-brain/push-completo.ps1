# ==============================================================================
# Push Completo e Tornar Publica - Autonomo
# ==============================================================================

Write-Host "=== Push Completo da Imagem ===" -ForegroundColor Cyan
Write-Host ""

# Navegar para raiz do projeto
$rootPath = Split-Path $PSScriptRoot -Parent
Set-Location $rootPath

# Ler token
$envPath = Join-Path $rootPath "env.local"
if (-not (Test-Path $envPath)) {
    Write-Host "ERRO: env.local nao encontrado" -ForegroundColor Red
    exit 1
}

$tokenLine = Get-Content $envPath | Select-String "^GIT_TOKEN="
if (-not $tokenLine) {
    Write-Host "ERRO: GIT_TOKEN nao encontrado" -ForegroundColor Red
    exit 1
}

$token = $tokenLine.ToString().Split('=')[1]
Write-Host "Token encontrado" -ForegroundColor Green
Write-Host ""

# Verificar se imagem existe
$imageName = "ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest"
$imageExists = docker images --filter "reference=$imageName" --format "{{.Repository}}:{{.Tag}}"
if (-not $imageExists) {
    Write-Host "ERRO: Imagem nao encontrada: $imageName" -ForegroundColor Red
    exit 1
}

Write-Host "Imagem encontrada: $imageName" -ForegroundColor Green
Write-Host ""

# Login
Write-Host "Fazendo login no GitHub Container Registry..." -ForegroundColor Cyan
$token | docker login ghcr.io -u thierrytasf7-stack --password-stdin 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha no login" -ForegroundColor Red
    Write-Host "Token pode nao ter permissao write:packages" -ForegroundColor Yellow
    Write-Host "Crie novo token em: https://github.com/settings/tokens" -ForegroundColor Cyan
    exit 1
}

Write-Host "Login realizado!" -ForegroundColor Green
Write-Host ""

# Push
Write-Host "Fazendo push da imagem..." -ForegroundColor Cyan
docker push $imageName

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Push concluido com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Tentar tornar publica via API
    Write-Host "Tentando tornar imagem publica via GitHub API..." -ForegroundColor Cyan
    
    $packageName = "diana-corporacao-senciente-maestro"
    $owner = "thierrytasf7-stack"
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Accept" = "application/vnd.github+json"
        "X-GitHub-Api-Version" = "2022-11-28"
    }
    
    try {
        $body = @{
            visibility = "public"
        } | ConvertTo-Json
        
        $url = "https://api.github.com/user/packages/container/$packageName"
        $response = Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $body -ContentType "application/json" -ErrorAction Stop
        
        Write-Host "Imagem tornada publica via API!" -ForegroundColor Green
        Write-Host ""
        Write-Host "=== Processo Completo! ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "Agora pode fazer deploy no Portainer" -ForegroundColor Cyan
        
    } catch {
        Write-Host "Nao foi possivel tornar publica via API" -ForegroundColor Yellow
        Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Faca manualmente:" -ForegroundColor Cyan
        Write-Host "1. Acesse: https://github.com/$owner?tab=packages" -ForegroundColor White
        Write-Host "2. Clique no pacote: $packageName" -ForegroundColor White
        Write-Host "3. Package settings -> Danger Zone -> Make public" -ForegroundColor White
    }
    
} else {
    Write-Host ""
    Write-Host "ERRO no push" -ForegroundColor Red
    Write-Host "Verifique se o token tem permissao write:packages" -ForegroundColor Yellow
}

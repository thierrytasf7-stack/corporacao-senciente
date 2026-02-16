# ==============================================================================
# Push da Imagem e Tornar Pública Automaticamente
# ==============================================================================

Write-Host "=== Push e Tornar Imagem Pública ===" -ForegroundColor Cyan
Write-Host ""

$imageName = "ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest"

# Verificar se a imagem existe
$imageExists = docker images --filter "reference=$imageName" --format "{{.Repository}}:{{.Tag}}"
if (-not $imageExists) {
    Write-Host "ERRO: Imagem não encontrada: $imageName" -ForegroundColor Red
    Write-Host "Execute primeiro o build da imagem." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Imagem encontrada: $imageName" -ForegroundColor Green
Write-Host ""

# Ler token do env.local
$envLocalPath = Join-Path (Split-Path $PSScriptRoot -Parent) "env.local"
$gitToken = $null

if (Test-Path $envLocalPath) {
    $tokenLine = Get-Content $envLocalPath | Select-String -Pattern "^GIT_TOKEN="
    if ($tokenLine) {
        $gitToken = $tokenLine.ToString().Split('=')[1]
        Write-Host "✓ Token encontrado no env.local" -ForegroundColor Green
    }
}

if (-not $gitToken) {
    Write-Host "Token não encontrado no env.local" -ForegroundColor Yellow
    Write-Host "Digite seu GitHub Personal Access Token (com permissão write:packages):" -ForegroundColor Cyan
    $gitToken = Read-Host "Token" -AsSecureString
    $gitToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($gitToken)
    )
}

# Login no GitHub Container Registry
Write-Host ""
Write-Host "Fazendo login no GitHub Container Registry..." -ForegroundColor Cyan
$gitToken | docker login ghcr.io -u thierrytasf7-stack --password-stdin

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha no login" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Login realizado!" -ForegroundColor Green

# Push da imagem
Write-Host ""
Write-Host "Fazendo push da imagem..." -ForegroundColor Cyan
docker push $imageName

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha no push" -ForegroundColor Red
    Write-Host "Verifique se o token tem permissão 'write:packages'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Push concluído!" -ForegroundColor Green

# Tornar imagem pública via GitHub API
Write-Host ""
Write-Host "Tornando imagem pública via GitHub API..." -ForegroundColor Cyan

$packageName = "diana-corporacao-senciente-maestro"
$owner = "thierrytasf7-stack"

$headers = @{
    "Authorization" = "Bearer $gitToken"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

try {
    # Tornar público
    $body = @{
        visibility = "public"
    } | ConvertTo-Json

    $url = "https://api.github.com/user/packages/container/$packageName"
    $response = Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $body -ContentType "application/json"
    
    Write-Host "✓ Imagem tornada pública!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Processo Completo! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Agora você pode fazer deploy no Portainer:" -ForegroundColor Cyan
    Write-Host "1. Vá em Stacks > Add Stack" -ForegroundColor White
    Write-Host "2. Cole o docker-compose.production.yml" -ForegroundColor White
    Write-Host "3. Configure TAILSCALE_IP" -ForegroundColor White
    Write-Host "4. Deploy" -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "⚠️  Não foi possível tornar pública via API" -ForegroundColor Yellow
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Faça manualmente:" -ForegroundColor Cyan
    Write-Host "1. Acesse: https://github.com/$owner?tab=packages" -ForegroundColor White
    Write-Host "2. Clique no pacote: $packageName" -ForegroundColor White
    Write-Host "3. Package settings -> Danger Zone -> Make public" -ForegroundColor White
}

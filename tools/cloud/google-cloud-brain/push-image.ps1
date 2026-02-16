# ==============================================================================
# Push da Imagem do Maestro para GitHub Container Registry
# ==============================================================================

Write-Host "=== Push da Imagem do Maestro ===" -ForegroundColor Cyan
Write-Host ""

$imageName = "ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest"

# Verificar se a imagem existe
$imageExists = docker images --filter "reference=$imageName" --format "{{.Repository}}:{{.Tag}}"
if (-not $imageExists) {
    Write-Host "ERRO: Imagem não encontrada: $imageName" -ForegroundColor Red
    Write-Host "Execute primeiro o build da imagem." -ForegroundColor Yellow
    exit 1
}

Write-Host "Imagem encontrada: $imageName" -ForegroundColor Green
Write-Host ""

# Verificar se está logado
Write-Host "Verificando login no GitHub Container Registry..." -ForegroundColor Cyan

$githubToken = $env:GITHUB_TOKEN
if ([string]::IsNullOrWhiteSpace($githubToken)) {
    Write-Host ""
    Write-Host "⚠️  Token GitHub não encontrado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para fazer push, você precisa:" -ForegroundColor Cyan
    Write-Host "1. Criar um Personal Access Token em: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "   - Permissões necessárias: write:packages" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Fazer login:" -ForegroundColor Cyan
    Write-Host "   `$env:GITHUB_TOKEN = 'seu-token'" -ForegroundColor Yellow
    Write-Host "   echo `$env:GITHUB_TOKEN | docker login ghcr.io -u thierrytasf7-stack --password-stdin" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "3. Fazer push:" -ForegroundColor Cyan
    Write-Host "   docker push $imageName" -ForegroundColor Yellow
    Write-Host ""
    
    $continue = Read-Host "Você tem o token agora? (s/n)"
    if ($continue -eq "s" -or $continue -eq "S") {
        $token = Read-Host "Digite o token" -AsSecureString
        $tokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
        )
        $tokenPlain | docker login ghcr.io -u thierrytasf7-stack --password-stdin
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Login realizado com sucesso!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Fazendo push da imagem..." -ForegroundColor Cyan
            docker push $imageName
        }
    } else {
        Write-Host "Push cancelado. Execute este script novamente quando tiver o token." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "Token encontrado, fazendo login..." -ForegroundColor Green
    $githubToken | docker login ghcr.io -u thierrytasf7-stack --password-stdin 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Login realizado!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Fazendo push da imagem..." -ForegroundColor Cyan
        docker push $imageName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "=== Push Concluído! ===" -ForegroundColor Green
            Write-Host ""
            Write-Host "Imagem disponível em:" -ForegroundColor Cyan
            Write-Host "  $imageName" -ForegroundColor White
            Write-Host ""
            Write-Host "Próximo passo: Deploy no Portainer" -ForegroundColor Cyan
        }
    }
}

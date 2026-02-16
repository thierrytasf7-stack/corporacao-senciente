# ==============================================================================
# Configurar Registry no Portainer via API
# ==============================================================================

Write-Host "=== Configurar GitHub Container Registry no Portainer ===" -ForegroundColor Cyan
Write-Host ""

# Solicitar informações
$portainerUrl = Read-Host "Digite a URL do Portainer (ex: https://100.78.145.65:9443)"
$portainerUser = Read-Host "Digite o usuário do Portainer (ex: admin)"
$portainerPass = Read-Host "Digite a senha do Portainer" -AsSecureString

# Ler token do env.local
$envLocalPath = Join-Path (Split-Path $PSScriptRoot -Parent) "env.local"
$gitToken = $null

if (Test-Path $envLocalPath) {
    $gitTokenLine = Get-Content $envLocalPath | Select-String -Pattern "^GIT_TOKEN="
    if ($gitTokenLine) {
        $gitToken = $gitTokenLine.ToString().Split('=')[1]
        Write-Host "✓ Token Git encontrado no env.local" -ForegroundColor Green
    }
}

if (-not $gitToken) {
    Write-Host "Token não encontrado no env.local" -ForegroundColor Yellow
    $gitToken = Read-Host "Digite seu GitHub Personal Access Token (com permissão read:packages)"
}

# Converter senha
$portainerPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($portainerPass)
)

Write-Host ""
Write-Host "Fazendo login no Portainer..." -ForegroundColor Cyan

# Login no Portainer
$loginBody = @{
    Username = $portainerUser
    Password = $portainerPassPlain
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$portainerUrl/api/auth" -Method Post -Body $loginBody -ContentType "application/json"
    $jwt = $loginResponse.jwt
    
    Write-Host "✓ Login realizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Criar registry
    Write-Host "Criando registry no Portainer..." -ForegroundColor Cyan
    
    $registryBody = @{
        Name = "ghcr.io"
        RegistryURL = "ghcr.io"
        Authentication = $true
        Username = "thierrytasf7-stack"
        Password = $gitToken
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $jwt"
    }
    
    $registryResponse = Invoke-RestMethod -Uri "$portainerUrl/api/registries" -Method Post -Body $registryBody -ContentType "application/json" -Headers $headers
    
    Write-Host ""
    Write-Host "=== Registry Configurado! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Registry criado: ghcr.io" -ForegroundColor Cyan
    Write-Host "Agora você pode fazer deploy da stack no Portainer." -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solução alternativa:" -ForegroundColor Yellow
    Write-Host "1. Acesse o Portainer manualmente: $portainerUrl" -ForegroundColor White
    Write-Host "2. Vá em Registries > Add registry" -ForegroundColor White
    Write-Host "3. Configure:" -ForegroundColor White
    Write-Host "   - Name: ghcr.io" -ForegroundColor Gray
    Write-Host "   - URL: ghcr.io" -ForegroundColor Gray
    Write-Host "   - Username: thierrytasf7-stack" -ForegroundColor Gray
    Write-Host "   - Password: $($gitToken.Substring(0, [Math]::Min(10, $gitToken.Length)))..." -ForegroundColor Gray
}

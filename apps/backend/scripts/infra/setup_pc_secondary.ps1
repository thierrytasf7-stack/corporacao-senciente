# Script PowerShell para configurar PCs Secundários da Corporação
# Executar como Administrador em cada PC secundário

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("business", "technical", "operations")]
    [string]$Specialization,

    [string]$BrainHost = "192.168.1.100",  # IP do PC Central
    [string]$SshPort = "2222",
    [string]$Username = "agent",
    [string]$Password = "corporacao2025"
)

$SpecializationNames = @{
    "business" = "Business (Marketing, Sales, Finance)"
    "technical" = "Technical (Dev, Debug, Validation)"
    "operations" = "Operations (DevEx, Metrics, Security)"
}

Write-Host "🏗️ Configurando PC Secundário: $($SpecializationNames[$Specialization])" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Yellow

# Configuração específica por especialização
$specializationConfig = @{
    business = @{
        packages = @("nodejs", "npm", "python3", "python3-pip", "postgresql-client")
        description = "Ferramentas de automação comercial, marketing e vendas"
    }
    technical = @{
        packages = @("nodejs", "npm", "python3", "python3-pip", "git", "docker.io", "build-essential", "openjdk-17-jdk")
        description = "Ambiente de desenvolvimento completo e ferramentas CI/CD"
    }
    operations = @{
        packages = @("nodejs", "npm", "python3", "python3-pip", "prometheus", "grafana", "postgresql-client", "curl", "wget")
        description = "Ferramentas de monitoramento, segurança e gestão operacional"
    }
}

# Instalar WSL2
Write-Host "📦 Instalando WSL2..." -ForegroundColor Yellow
wsl --install -d Ubuntu

Write-Host "⏳ Aguardando instalação completar..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Configurar usuário
Write-Host "👤 Configurando usuário..." -ForegroundColor Yellow
wsl -d Ubuntu -u root useradd -m -s /bin/bash $Username
wsl -d Ubuntu -u root sh -c "echo '$Username:$Password' | chpasswd"
wsl -d Ubuntu -u root usermod -aG sudo $Username
wsl -d Ubuntu -u root sh -c "echo '$Username ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/$Username"

# Configurar WSL para usar o usuário padrão
$wslConfPath = "$env:USERPROFILE\.wslconfig"
@"
[wsl2]
defaultUser = $Username
"@ | Out-File -FilePath $wslConfPath -Encoding UTF8 -Force

# Instalar SSH
Write-Host "🔐 Instalando SSH..." -ForegroundColor Yellow
wsl -d Ubuntu -u root apt update
wsl -d Ubuntu -u root apt install -y openssh-server
wsl -d Ubuntu -u root systemctl enable ssh

# Configurar SSH para aceitar conexões do PC Central
Write-Host "🔑 Configurando acesso SSH do PC Central..." -ForegroundColor Yellow

# Criar diretório .ssh
wsl -d Ubuntu -u $Username mkdir -p /home/$Username/.ssh
wsl -d Ubuntu -u $Username chmod 700 /home/$Username/.ssh

# Baixar chave pública do PC Central (assumindo que está acessível)
Write-Host "📥 Baixando chave pública do PC Central..." -ForegroundColor Yellow
try {
    # Tentar baixar da rede local (implementar servidor HTTP simples no PC Central)
    $brainKeyUrl = "http://$BrainHost`:8080/brain_key.pub"
    $brainKey = Invoke-WebRequest -Uri $brainKeyUrl -UseBasicParsing
    $brainKey.Content | wsl -d Ubuntu -u $Username sh -c "cat >> /home/$Username/.ssh/authorized_keys"
    Write-Host "✅ Chave do PC Central adicionada" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Não foi possível baixar chave automaticamente. Configure manualmente:" -ForegroundColor Yellow
    Write-Host "   1. Copie a chave de $env:USERPROFILE\.ssh\corporacao_brain.pub" -ForegroundColor White
    Write-Host "   2. Adicione em /home/$Username/.ssh/authorized_keys" -ForegroundColor White
}

wsl -d Ubuntu -u $Username chmod 600 /home/$Username/.ssh/authorized_keys

# Instalar pacotes específicos da especialização
Write-Host "📦 Instalando pacotes específicos..." -ForegroundColor Yellow
$config = $specializationConfig[$Specialization]
foreach ($package in $config.packages) {
    wsl -d Ubuntu -u root apt install -y $package
}

# Instalar Node.js (versão LTS)
wsl -d Ubuntu -u root curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
wsl -d Ubuntu -u root apt install -y nodejs

# Configurar especialização
Write-Host "🏷️ Configurando especialização..." -ForegroundColor Yellow

$specializationScript = @"
#!/bin/bash
# Configuração específica para PC $($SpecializationNames[$Specialization])

export PC_SPECIALIZATION="$Specialization"
export PC_DESCRIPTION="$($config.description)"
export BRAIN_HOST="$BrainHost"
export BRAIN_SSH_PORT="$SshPort"

# Configurações específicas por especialização
case "$Specialization" in
    "business")
        # Configurar ferramentas de marketing/automação comercial
        echo "Configurando ferramentas comerciais..."
        npm install -g @supabase/supabase-js google-ads-api
        pip3 install requests beautifulsoup4
        ;;
    "technical")
        # Configurar ambiente de desenvolvimento
        echo "Configurando ambiente de desenvolvimento..."
        npm install -g nodemon jest eslint
        pip3 install pytest black mypy
        # Configurar Docker
        sudo usermod -aG docker `$USER
        ;;
    "operations")
        # Configurar ferramentas de monitoramento
        echo "Configurando ferramentas de operações..."
        npm install -g pm2
        pip3 install psutil prometheus_client
        ;;
esac

echo "PC $Specialization configurado e pronto!"
"@

wsl -d Ubuntu -u root sh -c "echo '$specializationScript' > /usr/local/bin/configure-$Specialization.sh"
wsl -d Ubuntu -u root chmod +x /usr/local/bin/configure-$Specialization.sh

# Executar configuração da especialização
wsl -d Ubuntu -u $Username bash /usr/local/bin/configure-$Specialization.sh

# Configurar inicialização automática
Write-Host "🔄 Configurando inicialização automática..." -ForegroundColor Yellow

$initScript = @"
#!/bin/bash
# Script de inicialização do PC $Specialization

# Iniciar SSH
sudo systemctl start ssh

# Registrar no PC Central
curl -X POST http://$BrainHost`:3000/api/pcs/register \
  -H "Content-Type: application/json" \
  -d "{\`"hostname\`":\`"$env:COMPUTERNAME\`",\`"specialization\`":\`"$Specialization\`",\`"ip\`":\`"$((Get-NetIPAddress | Where-Object {$_.AddressFamily -eq 'IPv4' -and $_.PrefixOrigin -ne 'WellKnown'}).IPAddress)\`"}"

echo "PC $Specialization inicializado"
"@

wsl -d Ubuntu -u root sh -c "echo '$initScript' > /usr/local/bin/start-pc.sh"
wsl -d Ubuntu -u root chmod +x /usr/local/bin/start-pc.sh

# Configurar firewall
Write-Host "🔥 Configurando firewall..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "WSL2 SSH $Specialization" -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow -Profile Any

# Reiniciar WSL
Write-Host "🔄 Reiniciando WSL2..." -ForegroundColor Yellow
wsl --shutdown
Start-Sleep -Seconds 5

# Verificar instalação
Write-Host "🔍 Verificando instalação..." -ForegroundColor Yellow

$nodeVersion = wsl -d Ubuntu -u $Username node --version 2>$null
$npmVersion = wsl -d Ubuntu -u $Username npm --version 2>$null

Write-Host "📊 Configuração concluída:" -ForegroundColor Green
Write-Host "  🖥️ Especialização: $($SpecializationNames[$Specialization])" -ForegroundColor White
Write-Host "  👤 Usuário: $Username" -ForegroundColor White
Write-Host "  🧠 PC Central: $BrainHost`:$SshPort" -ForegroundColor White
Write-Host "  📦 Node.js: $($nodeVersion ? $nodeVersion : 'N/A')" -ForegroundColor White
Write-Host "  📦 NPM: $($npmVersion ? $npmVersion : 'N/A')" -ForegroundColor White

# Criar arquivo de configuração
$configFile = @"
{
  "specialization": "$Specialization",
  "description": "$($config.description)",
  "brainHost": "$BrainHost",
  "brainPort": "$SshPort",
  "setupDate": "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
  "hostname": "$env:COMPUTERNAME"
}
"@

$configPath = "$env:USERPROFILE\corporacao_$Specialization.json"
$configFile | Out-File -FilePath $configPath -Encoding UTF8

Write-Host "📄 Configuração salva em: $configPath" -ForegroundColor Cyan

Write-Host "" -ForegroundColor White
Write-Host "🚀 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Testar conexão: ssh -p $SshPort $Username@$BrainHost" -ForegroundColor White
Write-Host "2. Verificar registro no PC Central" -ForegroundColor White
Write-Host "3. Configurar aplicações específicas da especialização" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📚 Documentação: docs/05-operations/MULTI_PC_SETUP.md" -ForegroundColor Cyan






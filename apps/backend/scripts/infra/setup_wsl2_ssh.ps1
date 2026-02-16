# Script PowerShell para configurar WSL2 + SSH no PC Central (Brain)
# Executar como Administrador

param(
    [string]$SshPort = "2222",
    [string]$Username = "brain",
    [string]$Password = "corporacao2025"
)

Write-Host "🚀 Configurando WSL2 + SSH para Corporação Senciente" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Yellow

# Verificar se WSL2 já está instalado
$wslStatus = wsl --list --verbose 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ WSL2 já está instalado" -ForegroundColor Green
    wsl --list --verbose
} else {
    Write-Host "📦 Instalando WSL2..." -ForegroundColor Yellow
    wsl --install -d Ubuntu

    Write-Host "⏳ Aguardando instalação completar..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30

    # Configurar usuário padrão
    Write-Host "👤 Configurando usuário padrão..." -ForegroundColor Yellow
    wsl -d Ubuntu -u root useradd -m -s /bin/bash $Username
    wsl -d Ubuntu -u root sh -c "echo '$Username:$Password' | chpasswd"
    wsl -d Ubuntu -u root usermod -aG sudo $Username
    wsl -d Ubuntu -u root sh -c "echo '$Username ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/$Username"

    # Configurar WSL para usar o usuário padrão
    $wslConfPath = "$env:USERPROFILE\.wslconfig"
    @"
[wsl2]
defaultUser = $Username
"@ | Out-File -FilePath $wslConfPath -Encoding UTF8

    Write-Host "🔄 Reiniciando WSL2..." -ForegroundColor Yellow
    wsl --shutdown
    Start-Sleep -Seconds 5
}

# Instalar e configurar SSH no WSL2
Write-Host "🔐 Instalando e configurando SSH..." -ForegroundColor Yellow

wsl -d Ubuntu -u root apt update
wsl -d Ubuntu -u root apt install -y openssh-server
wsl -d Ubuntu -u root systemctl enable ssh
wsl -d Ubuntu -u root systemctl start ssh

# Configurar porta SSH personalizada
Write-Host "🔧 Configurando porta SSH: $SshPort" -ForegroundColor Yellow
wsl -d Ubuntu -u root sed -i "s/#Port 22/Port $SshPort/" /etc/ssh/sshd_config
wsl -d Ubuntu -u root systemctl restart ssh

# Gerar chaves SSH se não existirem
Write-Host "🔑 Gerando chaves SSH..." -ForegroundColor Yellow
wsl -d Ubuntu -u $Username mkdir -p /home/$Username/.ssh
wsl -d Ubuntu -u $Username ssh-keygen -t rsa -b 4096 -f /home/$Username/.ssh/id_rsa -N ""
wsl -d Ubuntu -u $Username cat /home/$Username/.ssh/id_rsa.pub >> /home/$Username/.ssh/authorized_keys
wsl -d Ubuntu -u $Username chmod 600 /home/$Username/.ssh/authorized_keys
wsl -d Ubuntu -u $Username chmod 700 /home/$Username/.ssh

# Copiar chave pública para Windows (para acesso remoto)
Write-Host "📋 Copiando chave pública para Windows..." -ForegroundColor Yellow
$keyContent = wsl -d Ubuntu -u $Username cat /home/$Username/.ssh/id_rsa.pub
$windowsKeyPath = "$env:USERPROFILE\.ssh\corporacao_brain.pub"
$keyContent | Out-File -FilePath $windowsKeyPath -Encoding UTF8

# Configurar inicialização automática
Write-Host "🔄 Configurando inicialização automática..." -ForegroundColor Yellow

# Criar script de inicialização do SSH
$initScript = @"
#!/bin/bash
# Script de inicialização da Corporação Senciente

# Iniciar SSH
sudo systemctl start ssh

# Verificar se está funcionando
if sudo systemctl is-active --quiet ssh; then
    echo "✅ SSH ativo na porta $SshPort"
else
    echo "❌ Erro no SSH"
fi

# Iniciar daemon da corporação (quando implementado)
# node /path/to/daemon.js &
"@
wsl -d Ubuntu -u root sh -c "echo '$initScript' > /usr/local/bin/start-corporacao.sh"
wsl -d Ubuntu -u root chmod +x /usr/local/bin/start-corporacao.sh

# Adicionar ao bashrc para inicialização automática
wsl -d Ubuntu -u $Username sh -c "echo '/usr/local/bin/start-corporacao.sh' >> /home/$Username/.bashrc"

# Instalar dependências básicas da corporação
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
wsl -d Ubuntu -u root apt install -y curl wget git vim htop
wsl -d Ubuntu -u root curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
wsl -d Ubuntu -u root apt install -y nodejs

# Verificar instalação
Write-Host "🔍 Verificando instalação..." -ForegroundColor Yellow
$nodeVersion = wsl -d Ubuntu -u $Username node --version
$npmVersion = wsl -d Ubuntu -u $Username npm --version

Write-Host "📊 Versões instaladas:" -ForegroundColor Cyan
Write-Host "  Node.js: $nodeVersion" -ForegroundColor White
Write-Host "  NPM: $npmVersion" -ForegroundColor White

# Configurar firewall do Windows
Write-Host "🔥 Configurando firewall..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "WSL2 SSH Brain" -Direction Inbound -Protocol TCP -LocalPort $SshPort -Action Allow -Profile Any

# Testar conexão local
Write-Host "🧪 Testando conexão SSH..." -ForegroundColor Yellow
try {
    $testResult = ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p $SshPort $Username@localhost "echo 'SSH funcionando!'"
    if ($testResult -match "SSH funcionando!") {
        Write-Host "✅ SSH funcionando corretamente!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ SSH pode precisar de ajustes manuais" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Teste de SSH falhou - verifique configuração manualmente" -ForegroundColor Yellow
}

# Documentação final
Write-Host "📚 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "PC Central (Brain) configurado:" -ForegroundColor Cyan
Write-Host "  🖥️ WSL2 Ubuntu: OK" -ForegroundColor White
Write-Host "  🔐 SSH Porta: $SshPort" -ForegroundColor White
Write-Host "  👤 Usuário: $Username" -ForegroundColor White
Write-Host "  🔑 Chave SSH: $env:USERPROFILE\.ssh\corporacao_brain.pub" -ForegroundColor White
Write-Host "  🚀 Inicialização: Automática" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Testar conexão: ssh -p $SshPort $Username@localhost" -ForegroundColor White
Write-Host "2. Configurar PCs secundários" -ForegroundColor White
Write-Host "3. Implementar comunicação entre PCs" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📁 Documentação: docs/01-getting-started/PC_CENTRAL_SETUP.md" -ForegroundColor Cyan






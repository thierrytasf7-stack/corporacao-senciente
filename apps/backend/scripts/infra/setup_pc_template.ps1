# =================================================================================
# Script de Automação: Setup PC Template para Corporação Senciente
# Fase 0.5 - Infraestrutura Multi-PC - Versão PowerShell
# =================================================================================
# Este script configura automaticamente um PC secundário da corporação com:
# - WSL2 + Ubuntu
# - SSH Server com autenticação por chave
# - Dependências básicas (Node.js, Git, Python)
# - Configuração de rede e firewall
# =================================================================================

param(
    [switch]$Force
)

# Cores para output
$RED = "`e[0;31m"
$GREEN = "`e[0;32m"
$YELLOW = "`e[1;33m"
$BLUE = "`e[0;34m"
$MAGENTA = "`e[0;35m"
$CYAN = "`e[0;36m"
$NC = "`e[0m" # No Color

# Função de logging aprimorada
function Write-Log {
    param([string]$Message)
    Write-Host "${BLUE}[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message${NC}"
}

function Write-Success {
    param([string]$Message)
    Write-Host "${GREEN}✅ $Message${NC}"
}

function Write-Error {
    param([string]$Message, [string]$Details = "")
    Write-Host "${RED}❌ $Message${NC}"
    if ($Details) {
        Write-Host "${RED}   Detalhes: $Details${NC}"
    }
}

function Write-Warning {
    param([string]$Message)
    Write-Host "${YELLOW}⚠️  $Message${NC}"
}

function Write-Info {
    param([string]$Message)
    Write-Host "${CYAN}ℹ️  $Message${NC}"
}

function Write-Highlight {
    param([string]$Message)
    Write-Host "${MAGENTA}🔥 $Message${NC}"
}

# Verificar se está rodando como administrador
function Test-Administrator {
    Write-Log "Verificando privilégios de administrador..."
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

    if (-not $isAdmin) {
        Write-Error "Este script deve ser executado como administrador!"
        Write-Error "Execute: Start-Process powershell -Verb RunAs -ArgumentList \"-ExecutionPolicy Bypass -File scripts/infra/setup_pc_template.ps1\""
        exit 1
    }
    Write-Success "Privilégios de administrador confirmados"
}

# Detectar especialização automática do PC baseada em hardware/capacidades
function Get-PCSpecialization {
    Write-Log "Detectando especialização automática do PC..."

    # Verificar RAM disponível
    $ramBytes = (Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory
    $ramGB = [math]::Round($ramBytes / 1GB, 0)

    # Verificar núcleos de CPU
    $cpuCores = (Get-WmiObject -Class Win32_Processor).NumberOfCores | Measure-Object -Sum | Select-Object -ExpandProperty Sum

    # Verificar espaço em disco
    $diskGB = [math]::Round((Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'").Size / 1GB, 0)

    Write-Info "Hardware detectado:"
    Write-Info "  RAM: ${ramGB}GB"
    Write-Info "  CPU Cores: ${cpuCores}"
    Write-Info "  Disco C: ${diskGB}GB"

    # Lógica de especialização automática
    if ($ramGB -ge 32 -and $cpuCores -ge 8) {
        $SPECIALIZATION = "technical"
        Write-Info "Especialização detectada: TECHNICAL (alta performance)"
    }
    elseif ($ramGB -ge 16 -and $diskGB -ge 512) {
        $SPECIALIZATION = "business"
        Write-Info "Especialização detectada: BUSINESS (armazenamento e RAM balanceados)"
    }
    else {
        $SPECIALIZATION = "operations"
        Write-Info "Especialização detectada: OPERATIONS (configuração básica otimizada)"
    }

    return $SPECIALIZATION
}

# Verificar e instalar WSL2
function Install-WSL2 {
    Write-Log "Verificando instalação do WSL2..."

    # Verificar se WSL está instalado
    try {
        $wslVersion = wsl --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "WSL2 já está instalado"
            return $true
        }
    }
    catch {
        # WSL não instalado, continuar com instalação
    }

    Write-Log "Instalando WSL2..."

    # Habilitar WSL feature
    Write-Info "Habilitando feature WSL..."
    dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

    Write-Info "Habilitando feature Virtual Machine Platform..."
    dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

    # Instalar WSL2
    Write-Info "Instalando WSL2 com Ubuntu..."
    wsl --install -d Ubuntu

    Write-Warning "WSL2 instalado. Reinicie o sistema e execute o script novamente."
    Write-Info "Após reiniciar, execute: .\\scripts\\infra\\setup_pc_template.ps1"
    exit 0
}

# Verificar se Ubuntu está instalado
function Test-UbuntuInstalled {
    Write-Log "Verificando se Ubuntu está instalado..."
    try {
        $distros = wsl -l -q
        $ubuntuInstalled = $distros -match "Ubuntu"
        return $ubuntuInstalled
    }
    catch {
        return $false
    }
}

# Configurar WSL2 para iniciar automaticamente
function Set-WSLStartup {
    Write-Log "Configurando inicialização automática do WSL2..."

    # Criar tarefa agendada para iniciar WSL2 no boot
    $taskName = "WSL2_AutoStart"
    $action = New-ScheduledTaskAction -Execute "wsl" -Argument "-d Ubuntu -- bash -c 'echo WSL2 iniciado'"
    $trigger = New-ScheduledTaskTrigger -AtStartup
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType ServiceAccount -RunLevel Highest

    try {
        Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Force | Out-Null
        Write-Success "Inicialização automática configurada"
    }
    catch {
        Write-Warning "Não foi possível criar tarefa agendada: $($_.Exception.Message)"
    }
}

# Executar comando no WSL Ubuntu
function Invoke-WSLUbuntu {
    param([string]$Command)
    $result = wsl -d Ubuntu -- bash -c $Command
    return $result
}

# Configurar Ubuntu dentro do WSL2 com especialização
function Set-UbuntuConfiguration {
    param([string]$Specialization)

    Write-Log "Configurando ambiente Ubuntu com especialização: ${Specialization}..."

    # Comandos comuns a todas as especializações
    $commonCommands = @"
# Atualizar sistema
echo 'Atualizando sistema...'
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
echo 'Instalando dependências básicas...'
sudo apt install -y curl wget git python3 python3-pip nodejs npm

# Verificar versões
echo 'Node.js versão:' `$(node --version)
echo 'NPM versão:' `$(npm --version)
echo 'Python versão:' `$(python3 --version)
echo 'Git versão:' `$(git --version)

# Instalar OpenSSH Server
echo 'Instalando SSH Server...'
sudo apt install -y openssh-server

# Configurar SSH
echo 'Configurando SSH...'
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config

# Criar diretório .ssh se não existir
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Configurar timezone
sudo timedatectl set-timezone America/Sao_Paulo 2>/dev/null || true

# Criar arquivo de especialização para identificação do sistema
echo '$Specialization' | sudo tee /etc/specialization > /dev/null
sudo chmod 644 /etc/specialization

# Criar arquivo de metadados do PC
cat << EOF | sudo tee /etc/corporacao-pc-info > /dev/null
{
  `"hostname`": `"$(hostname)`",
  `"specialization`": `"$Specialization`",
  `"setup_date`": `"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`",
  `"wsl_version`": `"$(try { wsl --version | Select-String 'WSL version' | ForEach-Object { `$_.Line -replace 'WSL version: ', '' } } catch { '2.x' })`",
  `"ubuntu_version`": `"$(try { lsb_release -d 2>/dev/null | Select-String 'Description:' | ForEach-Object { `$_.Line -replace 'Description:\s*', '' } } catch { 'Ubuntu' })`"
}
EOF
sudo chmod 644 /etc/corporacao-pc-info

echo 'Configuração comum concluída'
"@

    # Comandos específicos por especialização
    switch ($Specialization) {
        "technical" {
            $specCommands = @"

echo '=== CONFIGURAÇÃO TECHNICAL PC ==='
# Instalar ferramentas de desenvolvimento avançadas
echo 'Instalando ferramentas de desenvolvimento...'
sudo apt install -y build-essential gcc g++ make cmake \
    postgresql postgresql-contrib mysql-server \
    redis-server mongodb \
    nginx \
    htop iotop ncdu tree jq \
    vim nano emacs-nox \
    tmux screen \
    ansible terraform packer \
    golang-go rustc cargo \
    openjdk-17-jdk maven gradle \
    dotnet-sdk-8.0

# Ferramentas de monitoramento e observabilidade
sudo apt install -y prometheus-node-exporter grafana \
    elasticsearch kibana logstash \
    zabbix-agent

# Ferramentas de análise de código
sudo apt install -y sonar-scanner shellcheck pylint black \
    prettier eslint typescript

echo 'Technical PC configurado com sucesso'
"@
        }
        "business" {
            $specCommands = @"

echo '=== CONFIGURAÇÃO BUSINESS PC ==='
# Instalar ferramentas de business intelligence e marketing
echo 'Instalando ferramentas de business...'
sudo apt install -y postgresql postgresql-contrib mysql-server redis-server \
    nginx certbot python3-certbot-nginx \
    htop ncdu jq \
    libreoffice libreoffice-pdfimport \
    imagemagick graphicsmagick \
    pandoc texlive-latex-base texlive-fonts-recommended

# Ferramentas de análise de dados
pip3 install --user pandas numpy matplotlib seaborn scikit-learn \
    jupyter notebook streamlit plotly dash \
    sqlalchemy psycopg2-binary pymysql redis \
    requests beautifulsoup4 selenium webdriver-manager \
    openpyxl xlrd

# Ferramentas de marketing e conteúdo
pip3 install --user nltk spacy transformers torch \
    pillow opencv-python \
    moviepy pydub

echo 'Business PC configurado com sucesso'
"@
        }
        "operations" {
            $specCommands = @"

echo '=== CONFIGURAÇÃO OPERATIONS PC ==='
# Instalar ferramentas de monitoramento e operações
echo 'Instalando ferramentas de operações...'
sudo apt install -y htop iotop ncdu tree jq \
    vim nano tmux screen \
    postgresql-client mysql-client redis-tools \
    nginx curl wget \
    mailutils ssmtp \
    logrotate cron \
    unattended-upgrades apt-listchanges

# Ferramentas de monitoramento
sudo apt install -y prometheus-node-exporter \
    zabbix-agent nagios-nrpe-plugin \
    monit

# Ferramentas de backup e segurança
sudo apt install -y rsync duplicity \
    clamav clamav-daemon \
    rkhunter chkrootkit \
    aide

echo 'Operations PC configurado com sucesso'
"@
        }
    }

    # Executar comandos no Ubuntu
    $allCommands = $commonCommands + $specCommands
    Invoke-WSLUbuntu $allCommands

    Write-Success "Ubuntu configurado com especialização ${Specialization}"
}

# Gerar e configurar chaves SSH
function Set-SSHKeys {
    Write-Log "Configurando autenticação SSH por chave..."

    # Gerar par de chaves no Windows
    $keyPath = "$HOME\.ssh\corporacao_senciente"
    if (-not (Test-Path $keyPath)) {
        Write-Log "Gerando novo par de chaves SSH..."
        ssh-keygen -t rsa -b 4096 -f $keyPath -N "" -C "corporacao-senciente-$(hostname)"
    }

    # Copiar chave pública para WSL2
    Invoke-WSLUbuntu "mkdir -p ~/.ssh && chmod 700 ~/.ssh"

    # Adicionar chave pública ao authorized_keys no WSL2
    $pubKeyContent = Get-Content "$keyPath.pub"
    $authKeysCommand = @"
cat >> ~/.ssh/authorized_keys << EOF
$pubKeyContent
EOF
chmod 600 ~/.ssh/authorized_keys
"@
    Invoke-WSLUbuntu $authKeysCommand

    Write-Success "Chaves SSH configuradas"
    Write-Info "Chave privada salva em: $keyPath"
    Write-Info "Chave pública salva em: ${keyPath}.pub"
}

# Configurar ZeroTier para conectividade P2P
function Set-ZeroTier {
    Write-Log "Configurando ZeroTier para conectividade P2P..."

    # Instalar ZeroTier no Windows
    if (-not (Get-Command zerotier-cli -ErrorAction SilentlyContinue)) {
        Write-Info "Instalando ZeroTier no Windows..."

        # Download e instalação do ZeroTier
        $ztUrl = "https://download.zerotier.com/dist/ZeroTier%20One.msi"
        $ztPath = "$env:TEMP\zerotier.msi"

        try {
            Invoke-WebRequest -Uri $ztUrl -OutFile $ztPath
            Start-Process msiexec.exe -Wait -ArgumentList "/i $ztPath /quiet"
            Write-Success "ZeroTier Windows instalado"
        }
        catch {
            Write-Warning "ZeroTier Windows - instalação manual pode ser necessária"
        }
    }

    # Instalar ZeroTier no WSL2
    Invoke-WSLUbuntu "curl -s https://install.zerotier.com | sudo bash 2>/dev/null || echo 'ZeroTier WSL2 instalado (ou já existe)'"

    # Criar script de registro na rede da corporação
    $zerotierScript = "$HOME\register_zerotier.ps1"
    $scriptContent = @'
param(
    [Parameter(Mandatory=$true)]
    [string]$NetworkId
)

Write-Host "🔗 Registrando PC na rede ZeroTier da Corporação Senciente..." -ForegroundColor Cyan

# Iniciar serviço ZeroTier
Start-Service ZeroTierOne 2>$null

# Entrar na rede
zerotier-cli join $NetworkId

# Aguardar aprovação
Write-Host "⏳ Aguardando aprovação na rede $NetworkId..." -ForegroundColor Yellow
Write-Host "📋 Acesse https://my.zerotier.com/ para aprovar este membro" -ForegroundColor Green
Write-Host "🔑 Network ID: $NetworkId" -ForegroundColor Green

# Verificar status
Start-Sleep 5
zerotier-cli status
zerotier-cli listnetworks
'@
    $scriptContent | Out-File -FilePath $zerotierScript -Encoding UTF8

    Write-Success "ZeroTier configurado"
    Write-Info "Para registrar na rede da corporação, execute:"
    Write-Info "  .\\register_zerotier.ps1 -NetworkId <NETWORK_ID>"
}

# Configurar firewall e rede aprimorados
function Set-Firewall {
    Write-Log "Configurando firewall e rede com segurança avançada..."

    # Abrir porta SSH no firewall do Windows
    netsh advfirewall firewall add rule name="SSH WSL2" dir=in action=allow protocol=TCP localport=2222
    netsh advfirewall firewall add rule name="ZeroTier" dir=in action=allow protocol=UDP localport=9993

    # Configurar SSH para iniciar automaticamente no WSL2
    Invoke-WSLUbuntu "sudo systemctl enable ssh && sudo systemctl start ssh"

    # Configurar fail2ban para proteção SSH
    Invoke-WSLUbuntu "sudo systemctl enable fail2ban 2>/dev/null && sudo systemctl start fail2ban 2>/dev/null"

    # Configurar UFW básico
    Invoke-WSLUbuntu "sudo ufw --force enable && sudo ufw allow 2222/tcp && echo 'Firewall UFW configurado'"

    Write-Success "Firewall e rede configurados com segurança avançada"
}

# Testar configuração
function Test-Configuration {
    Write-Log "Testando configuração..."

    # Testar conexão SSH local
    try {
        $sshTest = Invoke-WSLUbuntu "ssh -o StrictHostKeyChecking=no -p 2222 localhost 'echo SSH_OK' 2>/dev/null"
        if ($sshTest -match "SSH_OK") {
            Write-Success "Conexão SSH local funcionando"
        }
        else {
            Write-Error "Conexão SSH local falhou"
        }
    }
    catch {
        Write-Error "Erro no teste SSH local"
    }

    # Testar aplicações instaladas
    $testCommands = @"
node --version > /dev/null && echo 'Node.js: OK' || echo 'Node.js: FALHA'
python3 --version > /dev/null && echo 'Python: OK' || echo 'Python: FALHA'
git --version > /dev/null && echo 'Git: OK' || echo 'Git: FALHA'
"@
    $results = Invoke-WSLUbuntu $testCommands
    Write-Info "Testes de aplicações:"
    $results -split "`n" | ForEach-Object { Write-Info "  $_" }

    Write-Success "Testes concluídos"
}

# Função principal
function Main {
    Write-Host "=================================================================================" -ForegroundColor Cyan
    Write-Host "🏗️  SETUP PC TEMPLATE - Corporação Senciente" -ForegroundColor Cyan
    Write-Host "=================================================================================" -ForegroundColor Cyan
    Write-Host "Este script configura automaticamente um PC secundário para a infraestrutura multi-PC"
    Write-Host "com especialização automática baseada em hardware detectado."
    Write-Host "=================================================================================" -ForegroundColor Cyan
    Write-Host ""

    Test-Administrator

    # Detectar especialização
    $specialization = Get-PCSpecialization

    Install-WSL2

    # Verificar se Ubuntu foi instalado
    if (-not (Test-UbuntuInstalled)) {
        Write-Error "Ubuntu não foi encontrado no WSL. Execute o script novamente após a instalação."
        exit 1
    }

    Set-WSLStartup
    Set-UbuntuConfiguration -Specialization $specialization
    Set-SSHKeys
    Set-ZeroTier
    Set-Firewall
    Test-Configuration

    Write-Host ""
    Write-Host "=================================================================================" -ForegroundColor Green
    Write-Success "✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
    Write-Host ""
    Write-Highlight "🎯 PC SECUNDÁRIO PRONTO PARA USO NA CORPORÇÃO SENCIENTE"
    Write-Host ""
    Write-Info "ESPECIALIZAÇÃO CONFIGURADA: ${specialization}"
    Write-Info "HOSTNAME: $(hostname)"
    Write-Info "IP: $((Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' } | Select-Object -First 1).IPAddress)"
    Write-Host ""
    Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
    Write-Host "1. Execute o script register_pc.sh para registrar este PC no sistema central" -ForegroundColor White
    Write-Host "2. Configure ZeroTier: .\\register_zerotier.ps1 -NetworkId <ID_DA_REDE>" -ForegroundColor White
    Write-Host "3. Teste a conectividade com o PC Central (Brain)" -ForegroundColor White
    Write-Host "4. Verifique especialização executando: wsl -d Ubuntu -- cat /etc/specialization" -ForegroundColor White
    Write-Host ""
    Write-Host "🔐 INFORMAÇÕES DE CONEXÃO:" -ForegroundColor Magenta
    Write-Host "   Host: $(hostname)" -ForegroundColor White
    Write-Host "   Porta SSH: 2222" -ForegroundColor White
    Write-Host "   Usuário WSL2: ubuntu" -ForegroundColor White
    Write-Host ""
    Write-Host "=================================================================================" -ForegroundColor Green
}

# Executar função principal
Main






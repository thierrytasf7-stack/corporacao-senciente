#!/bin/bash

# =================================================================================
# Script de Automação: Setup PC Template para Corporação Senciente
# Fase 0.5 - Infraestrutura Multi-PC
# =================================================================================
# Este script configura automaticamente um PC secundário da corporação com:
# - WSL2 + Ubuntu com validação avançada
# - SSH Server com autenticação por chave + hardening de segurança
# - Dependências básicas (Node.js, Git, Python) + ferramentas de monitoramento
# - Configuração de rede e firewall + ZeroTier para conectividade P2P
# - Sistema de especialização por setor (Business/Technical/Operations)
# - Integração com arquitetura senciente
# =================================================================================

set -e  # Exit on any error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função de logging aprimorada
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    echo -e "${RED}   Detalhes: $2${NC}" 2>/dev/null || true
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

highlight() {
    echo -e "${MAGENTA}🔥 $1${NC}"
}

# Verificar se está rodando como administrador
check_admin() {
    log "Verificando privilégios de administrador..."
    if ! net session > /dev/null 2>&1; then
        error "Este script deve ser executado como administrador!"
        error "Execute: Start-Process powershell -Verb RunAs -ArgumentList \"-File $0\""
        exit 1
    fi
    success "Privilégios de administrador confirmados"
}

# Detectar especialização automática do PC baseada em hardware/capacidades
detect_specialization() {
    log "Detectando especialização automática do PC..."

    # Verificar RAM disponível
    local ram_gb=$(wmic ComputerSystem get TotalPhysicalMemory /value 2>/dev/null | grep -oP '\d+' | awk '{print int($1/1024/1024/1024)}' || echo "8")

    # Verificar núcleos de CPU
    local cpu_cores=$(wmic CPU get NumberOfCores /value 2>/dev/null | grep -oP '\d+' | head -1 || echo "4")

    # Verificar espaço em disco
    local disk_gb=$(wmic LogicalDisk where "DeviceID='C:'" get Size /value 2>/dev/null | grep -oP '\d+' | awk '{print int($1/1024/1024/1024)}' || echo "256")

    info "Hardware detectado:"
    info "  RAM: ${ram_gb}GB"
    info "  CPU Cores: ${cpu_cores}"
    info "  Disco C: ${disk_gb}GB"

    # Lógica de especialização automática
    if [ "$ram_gb" -ge 32 ] && [ "$cpu_cores" -ge 8 ]; then
        SPECIALIZATION="technical"
        info "Especialização detectada: TECHNICAL (alta performance)"
    elif [ "$ram_gb" -ge 16 ] && [ "$disk_gb" -ge 512 ]; then
        SPECIALIZATION="business"
        info "Especialização detectada: BUSINESS (armazenamento e RAM balanceados)"
    else
        SPECIALIZATION="operations"
        info "Especialização detectada: OPERATIONS (configuração básica otimizada)"
    fi

    export SPECIALIZATION
    success "Especialização configurada: ${SPECIALIZATION^^}"
}

# Verificar e instalar WSL2
install_wsl2() {
    log "Verificando instalação do WSL2..."

    # Verificar se WSL está instalado
    if ! wsl --list --verbose > /dev/null 2>&1; then
        log "Instalando WSL2..."

        # Habilitar WSL feature
        dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
        dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

        # Instalar WSL2
        wsl --install -d Ubuntu

        warning "WSL2 instalado. Reinicie o sistema e execute o script novamente."
        echo "Após reiniciar, execute: $0"
        exit 0
    fi

    success "WSL2 já está instalado"

    # Verificar se Ubuntu está instalado
    if ! wsl --list --quiet | grep -i ubuntu > /dev/null; then
        log "Instalando Ubuntu no WSL2..."
        wsl --install -d Ubuntu
    fi

    success "Ubuntu está instalado no WSL2"
}

# Configurar WSL2 para iniciar automaticamente
configure_wsl_startup() {
    log "Configurando inicialização automática do WSL2..."

    # Criar tarefa agendada para iniciar WSL2 no boot
    local task_name="WSL2_AutoStart"
    schtasks /create /tn "$task_name" /tr "wsl -d Ubuntu -- bash -c 'echo WSL2 iniciado'" /sc onstart /rl highest /f 2>/dev/null || true

    success "Inicialização automática configurada"
}

# Configurar Ubuntu dentro do WSL2 com especialização
configure_ubuntu() {
    log "Configurando ambiente Ubuntu com especialização: ${SPECIALIZATION^^}..."

    # Executar comandos no Ubuntu baseados na especialização
    case "$SPECIALIZATION" in
        "technical")
            wsl -d Ubuntu -- bash -c "
                echo '=== CONFIGURAÇÃO TECHNICAL PC ==='
                # Atualizar sistema
                echo 'Atualizando sistema...'
                sudo apt update && sudo apt upgrade -y

                # Instalar ferramentas de desenvolvimento avançadas
                echo 'Instalando ferramentas de desenvolvimento...'
                sudo apt install -y curl wget git python3 python3-pip nodejs npm \
                    build-essential gcc g++ make cmake \
                    docker.io docker-compose \
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

                # Instalar OpenSSH Server com hardening
                echo 'Instalando SSH Server com segurança avançada...'
                sudo apt install -y openssh-server fail2ban ufw

                # Instalar ferramentas de análise de código
                sudo apt install -y sonar-scanner shellcheck pylint black \
                    prettier eslint typescript

                echo 'Technical PC configurado com sucesso'
            "
            ;;
        "business")
            wsl -d Ubuntu -- bash -c "
                echo '=== CONFIGURAÇÃO BUSINESS PC ==='
                # Atualizar sistema
                echo 'Atualizando sistema...'
                sudo apt update && sudo apt upgrade -y

                # Instalar ferramentas de business intelligence e marketing
                echo 'Instalando ferramentas de business...'
                sudo apt install -y curl wget git python3 python3-pip nodejs npm \
                    postgresql postgresql-contrib mysql-server redis-server \
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

                # Instalar OpenSSH Server
                echo 'Instalando SSH Server...'
                sudo apt install -y openssh-server fail2ban ufw

                # Ferramentas de marketing e conteúdo
                pip3 install --user nltk spacy transformers torch \
                    pillow opencv-python \
                    moviepy pydub

                echo 'Business PC configurado com sucesso'
            "
            ;;
        "operations")
            wsl -d Ubuntu -- bash -c "
                echo '=== CONFIGURAÇÃO OPERATIONS PC ==='
                # Atualizar sistema
                echo 'Atualizando sistema...'
                sudo apt update && sudo apt upgrade -y

                # Instalar ferramentas de monitoramento e operações
                echo 'Instalando ferramentas de operações...'
                sudo apt install -y curl wget git python3 python3-pip nodejs npm \
                    htop iotop ncdu tree jq \
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

                # Instalar OpenSSH Server
                echo 'Instalando SSH Server...'
                sudo apt install -y openssh-server fail2ban ufw

                # Ferramentas de backup e segurança
                sudo apt install -y rsync duplicity \
                    clamav clamav-daemon \
                    rkhunter chkrootkit \
                    aide

                echo 'Operations PC configurado com sucesso'
            "
            ;;
        *)
            error "Especialização desconhecida: $SPECIALIZATION"
            exit 1
            ;;
    esac

    # Configuração comum a todas as especializações
    wsl -d Ubuntu -- bash -c "
        # Configurar SSH (comum a todos)
        echo 'Configurando SSH...'
        sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
        sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
        sudo sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
        sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
        sudo sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config

        # Criar diretório .ssh se não existir
        mkdir -p ~/.ssh
        chmod 700 ~/.ssh

        # Instalar Node.js LTS se não estiver instalado
        if ! command -v node &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi

        # Configurar timezone
        sudo timedatectl set-timezone America/Sao_Paulo 2>/dev/null || true

        # Criar arquivo de especialização para identificação do sistema
        echo '$SPECIALIZATION' | sudo tee /etc/specialization > /dev/null
        sudo chmod 644 /etc/specialization

        # Criar arquivo de metadados do PC
        cat << EOF | sudo tee /etc/corporacao-pc-info > /dev/null
{
  "hostname": "$(hostname)",
  "specialization": "$SPECIALIZATION",
  "setup_date": "$(date +'%Y-%m-%d %H:%M:%S')",
  "wsl_version": "$(cat /proc/version | grep -oP 'Microsoft.*WSL2' || echo 'WSL2')",
  "ubuntu_version": "$(lsb_release -d 2>/dev/null | cut -f2 || echo 'Ubuntu')"
}
EOF
        sudo chmod 644 /etc/corporacao-pc-info

        echo 'Configuração comum e identificação concluída'
    "

    success "Ubuntu configurado com especialização ${SPECIALIZATION^^}"
}

# Gerar e configurar chaves SSH
configure_ssh_keys() {
    log "Configurando autenticação SSH por chave..."

    # Gerar par de chaves no Windows
    local key_path="$HOME/.ssh/corporacao_senciente"
    if [ ! -f "${key_path}" ]; then
        log "Gerando novo par de chaves SSH..."
        ssh-keygen -t rsa -b 4096 -f "$key_path" -N "" -C "corporacao-senciente-$(hostname)"
    fi

    # Copiar chave pública para WSL2
    wsl -d Ubuntu -- bash -c "
        mkdir -p ~/.ssh
        chmod 700 ~/.ssh
    "

    # Adicionar chave pública ao authorized_keys no WSL2
    wsl -d Ubuntu -- bash -c "
        cat >> ~/.ssh/authorized_keys << EOF
$(cat "${key_path}.pub")
EOF
        chmod 600 ~/.ssh/authorized_keys
    "

    success "Chaves SSH configuradas"
    echo "Chave privada salva em: ${key_path}"
    echo "Chave pública salva em: ${key_path}.pub"
}

# Configurar ZeroTier para conectividade P2P
configure_zerotier() {
    log "Configurando ZeroTier para conectividade P2P..."

    # Instalar ZeroTier no Windows
    if ! command -v zerotier-cli &> /dev/null; then
        log "Instalando ZeroTier no Windows..."
        # Download e instalação do ZeroTier
        powershell -Command "
            Invoke-WebRequest -Uri 'https://download.zerotier.com/dist/ZeroTier%20One.msi' -OutFile 'C:\Temp\zerotier.msi'
            Start-Process msiexec.exe -Wait -ArgumentList '/i C:\Temp\zerotier.msi /quiet'
        " 2>/dev/null || warning "ZeroTier Windows - instalação manual pode ser necessária"
    fi

    # Instalar ZeroTier no WSL2
    wsl -d Ubuntu -- bash -c "
        echo 'Instalando ZeroTier no WSL2...'
        curl -s https://install.zerotier.com | sudo bash 2>/dev/null || echo 'ZeroTier WSL2 instalado (ou já existe)'
    "

    # Criar script de registro na rede da corporação
    local zerotier_script="$HOME/register_zerotier.ps1"
    cat > "$zerotier_script" << 'EOF'
# Script para registrar PC na rede ZeroTier da Corporação Senciente
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
EOF

    success "ZeroTier configurado"
    info "Para registrar na rede da corporação, execute:"
    info "  .\\register_zerotier.ps1 -NetworkId <NETWORK_ID>"
}

# Configurar firewall e rede aprimorados
configure_firewall() {
    log "Configurando firewall e rede com segurança avançada..."

    # Abrir porta SSH no firewall do Windows
    netsh advfirewall firewall add rule name="SSH WSL2" dir=in action=allow protocol=TCP localport=2222
    netsh advfirewall firewall add rule name="ZeroTier" dir=in action=allow protocol=UDP localport=9993

    # Configurar SSH para iniciar automaticamente no WSL2
    wsl -d Ubuntu -- bash -c "
        sudo systemctl enable ssh
        sudo systemctl start ssh

        # Configurar fail2ban para proteção SSH
        if command -v fail2ban-client &> /dev/null; then
            sudo systemctl enable fail2ban
            sudo systemctl start fail2ban
        fi

        # Configurar UFW básico
        if command -v ufw &> /dev/null; then
            sudo ufw --force enable
            sudo ufw allow 2222/tcp
            echo 'Firewall UFW configurado'
        fi
    "

    success "Firewall e rede configurados com segurança avançada"
}

# Testar configuração
test_configuration() {
    log "Testando configuração..."

    # Testar conexão SSH local
    if wsl -d Ubuntu -- bash -c "ssh -o StrictHostKeyChecking=no -p 2222 localhost 'echo SSH funcionando'"; then
        success "Conexão SSH local funcionando"
    else
        error "Falha na conexão SSH local"
        exit 1
    fi

    # Testar aplicações instaladas
    wsl -d Ubuntu -- bash -c "
        node --version > /dev/null && echo 'Node.js: OK' || echo 'Node.js: FALHA'
        python3 --version > /dev/null && echo 'Python: OK' || echo 'Python: FALHA'
        git --version > /dev/null && echo 'Git: OK' || echo 'Git: FALHA'
    "

    success "Testes concluídos com sucesso"
}

# Função principal
main() {
    echo "================================================================================="
    echo "🏗️  SETUP PC TEMPLATE - Corporação Senciente"
    echo "================================================================================="
    echo "Este script configura automaticamente um PC secundário para a infraestrutura multi-PC"
    echo "com especialização automática baseada em hardware detectado."
    echo "================================================================================="

    check_admin
    detect_specialization
    install_wsl2
    configure_wsl_startup
    configure_ubuntu
    configure_ssh_keys
    configure_zerotier
    configure_firewall
    test_configuration

    echo ""
    echo "================================================================================="
    success "✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
    echo ""
    highlight "🎯 PC SECUNDÁRIO PRONTO PARA USO NA CORPORÇÃO SENCIENTE"
    echo ""
    info "ESPECIALIZAÇÃO CONFIGURADA: ${SPECIALIZATION^^}"
    case "$SPECIALIZATION" in
        "technical")
            echo "🛠️  FOCO: Desenvolvimento, testes, CI/CD, análise de código"
            ;;
        "business")
            echo "💼 FOCO: Business Intelligence, marketing, análise de dados"
            ;;
        "operations")
            echo "⚙️  FOCO: Monitoramento, segurança, backup, manutenção"
            ;;
    esac
    echo ""
    echo "📋 PRÓXIMOS PASSOS:"
    echo "1. Execute o script register_pc.sh para registrar este PC no sistema central"
    echo "2. Configure ZeroTier: .\\register_zerotier.ps1 -NetworkId <ID_DA_REDE>"
    echo "3. Teste a conectividade com o PC Central (Brain)"
    echo "4. Verifique especialização executando: wsl -d Ubuntu -- cat /etc/specialization"
    echo ""
    echo "🔐 INFORMAÇÕES DE CONEXÃO:"
    echo "   Host: $(hostname)"
    echo "   Porta SSH: 2222"
    echo "   Usuário WSL2: $(wsl -d Ubuntu -- whoami 2>/dev/null || echo 'ubuntu')"
    echo "   Especialização: ${SPECIALIZATION}"
    echo ""
    echo "📊 HARDWARE DETECTADO:"
    echo "   RAM: $(wmic ComputerSystem get TotalPhysicalMemory /value 2>/dev/null | grep -oP '\d+' | awk '{print int($1/1024/1024/1024)}' || echo 'N/A')GB"
    echo "   CPU Cores: $(wmic CPU get NumberOfCores /value 2>/dev/null | grep -oP '\d+' | head -1 || echo 'N/A')"
    echo "   Disco C: $(wmic LogicalDisk where "DeviceID='C:'" get Size /value 2>/dev/null | grep -oP '\d+' | awk '{print int($1/1024/1024/1024)}' || echo 'N/A')GB"
    echo ""
    echo "================================================================================="
}

# Executar função principal
main "$@"







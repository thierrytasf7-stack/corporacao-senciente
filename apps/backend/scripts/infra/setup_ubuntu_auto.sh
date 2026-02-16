#!/bin/bash

# =================================================================================
# Script de Configuração Automática - Ubuntu WSL2
# Fase 0.5 - Infraestrutura Multi-PC
# =================================================================================
# Configura automaticamente o Ubuntu no WSL2 para a Corporação Senciente
# =================================================================================

echo "================================================================================="
echo "🚀 CONFIGURAÇÃO AUTOMÁTICA - UBUNTU WSL2"
echo "================================================================================="

# Verificar se estamos no Ubuntu WSL2
if ! grep -q "microsoft" /proc/version 2>/dev/null; then
    echo "❌ Este script deve ser executado dentro do Ubuntu WSL2"
    echo "Abra o Ubuntu e execute: bash scripts/infra/setup_ubuntu_auto.sh"
    exit 1
fi

echo "✅ Executando no Ubuntu WSL2"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    echo -e "${RED}   Detalhes: $2${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Passo 1: Atualizar sistema
log "Passo 1: Atualizando sistema..."
if sudo apt update && sudo apt upgrade -y; then
    success "Sistema atualizado com sucesso"
else
    error "Falha ao atualizar sistema"
    exit 1
fi

# Passo 2: Instalar dependências básicas
log "Passo 2: Instalando dependências básicas..."
if sudo apt install -y curl wget git python3 python3-pip nodejs npm; then
    success "Dependências básicas instaladas"
else
    error "Falha ao instalar dependências básicas"
    exit 1
fi

# Verificar versões instaladas
log "Verificando versões instaladas..."
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "Python: $(python3 --version)"
echo "Git: $(git --version)"

# Passo 3: Instalar SSH Server
log "Passo 3: Instalando SSH Server..."
if sudo apt install -y openssh-server; then
    success "SSH Server instalado"
else
    error "Falha ao instalar SSH Server"
    exit 1
fi

# Passo 4: Configurar SSH
log "Passo 4: Configurando SSH..."
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config

# Criar diretório .ssh se não existir
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Passo 5: Iniciar SSH
log "Passo 5: Iniciando SSH..."
if sudo systemctl enable ssh && sudo systemctl start ssh; then
    success "SSH configurado e iniciado"
else
    error "Falha ao configurar SSH"
    exit 1
fi

# Passo 6: Detectar especialização baseada em hardware
log "Passo 6: Detectando especialização do PC..."

# Detectar hardware
RAM_GB=$(free -g | grep Mem | awk '{print $2}')
CPU_CORES=$(nproc)
DISK_GB=$(df / | tail -1 | awk '{print int($2/1024/1024)}')

echo "Hardware detectado:"
echo "  RAM: ${RAM_GB}GB"
echo "  CPU Cores: ${CPU_CORES}"
echo "  Disco: ${DISK_GB}GB"

# Lógica de especialização
if [ "$RAM_GB" -ge 32 ] && [ "$CPU_CORES" -ge 8 ]; then
    SPECIALIZATION="technical"
    echo "Especialização: TECHNICAL (alta performance)"
elif [ "$RAM_GB" -ge 16 ] && [ "$DISK_GB" -ge 512 ]; then
    SPECIALIZATION="business"
    echo "Especialização: BUSINESS (armazenamento e RAM balanceados)"
else
    SPECIALIZATION="operations"
    echo "Especialização: OPERATIONS (configuração básica otimizada)"
fi

# Salvar especialização
echo "$SPECIALIZATION" | sudo tee /etc/specialization > /dev/null
success "Especialização configurada: $SPECIALIZATION"

# Passo 7: Instalar ferramentas específicas por especialização
log "Passo 7: Instalando ferramentas específicas ($SPECIALIZATION)..."

case "$SPECIALIZATION" in
    "technical")
        echo "Instalando ferramentas de desenvolvimento avançadas..."
        sudo apt install -y build-essential gcc g++ make cmake \
            postgresql postgresql-contrib mysql-server redis-server \
            nginx htop iotop ncdu tree jq vim nano tmux screen \
            ansible terraform packer golang-go openjdk-17-jdk maven gradle
        ;;
    "business")
        echo "Instalando ferramentas de business intelligence..."
        sudo apt install -y postgresql postgresql-contrib mysql-server redis-server \
            nginx htop ncdu jq libreoffice pandoc texlive-latex-base

        # Instalar bibliotecas Python para análise de dados
        pip3 install pandas numpy matplotlib seaborn scikit-learn jupyter notebook \
            sqlalchemy requests beautifulsoup4 openpyxl
        ;;
    "operations")
        echo "Instalando ferramentas de monitoramento e operações..."
        sudo apt install -y htop iotop ncdu tree jq vim nano tmux screen \
            postgresql-client mysql-client redis-tools nginx curl wget \
            rsync monit logrotate unattended-upgrades clamav rkhunter chkrootkit aide
        ;;
    *)
        warning "Especialização desconhecida, instalando ferramentas básicas"
        ;;
esac

success "Ferramentas específicas instaladas"

# Passo 8: Configurar metadados do PC
log "Passo 8: Configurando metadados do PC..."

cat << EOF | sudo tee /etc/corporacao-pc-info > /dev/null
{
  "hostname": "$(hostname)",
  "specialization": "$SPECIALIZATION",
  "setup_date": "$(date +'%Y-%m-%d %H:%M:%S')",
  "wsl_version": "$(grep 'microsoft' /proc/version | head -1 || echo 'WSL2')",
  "ubuntu_version": "$(lsb_release -d 2>/dev/null | cut -f2 || echo 'Ubuntu')",
  "hardware": {
    "ram_gb": $RAM_GB,
    "cpu_cores": $CPU_CORES,
    "disk_gb": $DISK_GB
  }
}
EOF
sudo chmod 644 /etc/corporacao-pc-info

success "Metadados do PC configurados"

# Passo 9: Configurar timezone
log "Passo 9: Configurando timezone..."
sudo timedatectl set-timezone America/Sao_Paulo 2>/dev/null || true

# Passo 10: Testes finais
log "Passo 10: Executando testes finais..."

# Testar SSH local
if ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no -p 2222 localhost "echo 'SSH_OK'" 2>/dev/null | grep -q "SSH_OK"; then
    success "Teste SSH local: PASSOU"
else
    warning "Teste SSH local: FALHOU (pode ser normal na primeira execução)"
fi

# Verificar serviços
if sudo systemctl is-active ssh | grep -q "active"; then
    success "Serviço SSH: ATIVO"
else
    error "Serviço SSH: INATIVO"
fi

echo ""
echo "================================================================================="
success "CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
echo ""
echo "🎯 Ubuntu WSL2 configurado para Corporação Senciente"
echo ""
echo "📊 INFORMAÇÕES DO SISTEMA:"
echo "   Hostname: $(hostname)"
echo "   Especialização: $SPECIALIZATION"
echo "   RAM: ${RAM_GB}GB | CPU: ${CPU_CORES} cores | Disco: ${DISK_GB}GB"
echo ""
echo "🔧 PRÓXIMOS PASSOS:"
echo "1. Gere chaves SSH no Windows PowerShell:"
echo "   ssh-keygen -t rsa -b 4096 -f \$HOME\\.ssh\\corporacao_senciente -N '' -C 'corporacao-senciente-$(hostname)'"
echo ""
echo "2. Copie a chave pública para o Ubuntu:"
echo "   cat \$HOME\\.ssh\\corporacao_senciente.pub >> ~/.ssh/authorized_keys"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "3. Configure firewall no Windows:"
echo "   netsh advfirewall firewall add rule name=\"SSH WSL2\" dir=in action=allow protocol=TCP localport=2222"
echo ""
echo "4. Teste a configuração:"
echo "   powershell -ExecutionPolicy Bypass -File scripts/infra/check_infra.ps1"
echo ""
echo "================================================================================="






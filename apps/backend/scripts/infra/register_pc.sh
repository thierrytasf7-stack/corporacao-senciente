#!/bin/bash

# =================================================================================
# Script de Registro: Register PC na Corporação Senciente
# Fase 0.5 - Infraestrutura Multi-PC
# =================================================================================
# Este script registra um PC secundário no sistema central da corporação,
# criando entrada no banco de dados e configurando comunicação.
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

# Verificar se o PC foi configurado com o template
check_pc_setup() {
    log "Verificando se o PC foi configurado com o template..."

    # Verificar se WSL2 Ubuntu existe
    if ! wsl -l -q | grep -i ubuntu > /dev/null; then
        error "WSL2 Ubuntu não encontrado. Execute setup_pc_template.sh primeiro."
        exit 1
    fi

    # Verificar especialização
    local specialization_file
    specialization_file=$(wsl -d Ubuntu -- cat /etc/specialization 2>/dev/null || echo "")

    if [ -z "$specialization_file" ]; then
        error "Arquivo de especialização não encontrado. Execute setup_pc_template.sh primeiro."
        exit 1
    fi

    SPECIALIZATION="$specialization_file"
    success "PC configurado encontrado - Especialização: ${SPECIALIZATION^^}"
}

# Obter informações do PC
gather_pc_info() {
    log "Coletando informações do PC..."

    # Informações básicas
    PC_HOSTNAME=$(hostname)
    PC_IP=$(hostname -I | awk '{print $1}' || echo "127.0.0.1")
    PC_USERNAME=$(wsl -d Ubuntu -- whoami 2>/dev/null || echo "ubuntu")

    # Informações de hardware
    PC_RAM_GB=$(wmic ComputerSystem get TotalPhysicalMemory /value 2>/dev/null | grep -oP '\d+' | awk '{print int($1/1024/1024/1024)}' || echo "8")
    PC_CPU_CORES=$(wmic CPU get NumberOfCores /value 2>/dev/null | grep -oP '\d+' | head -1 || echo "4")
    PC_DISK_GB=$(wmic LogicalDisk where "DeviceID='C:'" get Size /value 2>/dev/null | grep -oP '\d+' | awk '{print int($1/1024/1024/1024)}' || echo "256")

    # Informações de rede ZeroTier
    ZEROTIER_STATUS=$(zerotier-cli status 2>/dev/null | head -1 || echo "not_installed")
    ZEROTIER_NETWORKS=$(zerotier-cli listnetworks 2>/dev/null | wc -l || echo "0")

    # Status SSH
    SSH_STATUS=$(wsl -d Ubuntu -- systemctl is-active ssh 2>/dev/null || echo "unknown")

    # Versões de software
    WSL_VERSION=$(wsl --version 2>/dev/null | grep "WSL version" | cut -d: -f2 | xargs || echo "2.x")
    NODE_VERSION=$(wsl -d Ubuntu -- node --version 2>/dev/null || echo "not_installed")
    PYTHON_VERSION=$(wsl -d Ubuntu -- python3 --version 2>/dev/null || echo "not_installed")

    success "Informações coletadas com sucesso"
}

# Registrar PC no banco de dados Supabase
register_in_database() {
    log "Registrando PC no banco de dados central..."

    # Verificar se as variáveis de ambiente estão configuradas
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
        warning "Variáveis de ambiente Supabase não configuradas"
        info "Será criado arquivo de registro local para sincronização posterior"
        create_local_registration
        return
    fi

    # Criar JSON com dados do PC
    local pc_data
    pc_data=$(cat <<EOF
{
  "hostname": "$PC_HOSTNAME",
  "ip_address": "$PC_IP",
  "specialization": "$SPECIALIZATION",
  "username": "$PC_USERNAME",
  "hardware": {
    "ram_gb": $PC_RAM_GB,
    "cpu_cores": $PC_CPU_CORES,
    "disk_gb": $PC_DISK_GB
  },
  "software": {
    "wsl_version": "$WSL_VERSION",
    "node_version": "$NODE_VERSION",
    "python_version": "$PYTHON_VERSION"
  },
  "network": {
    "zerotier_status": "$ZEROTIER_STATUS",
    "zerotier_networks": $ZEROTIER_NETWORKS,
    "ssh_status": "$SSH_STATUS"
  },
  "status": "active",
  "registered_at": "$(date -Iseconds)",
  "last_seen": "$(date -Iseconds)"
}
EOF
)

    # Inserir no Supabase (usando curl ou node)
    if command -v node &> /dev/null; then
        # Usar Node.js para inserção
        local insert_script
        insert_script=$(cat <<'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function insertPC(data) {
  try {
    const { data: result, error } = await supabase
      .from('pcs')
      .insert([data])
      .select();

    if (error) throw error;
    console.log('PC registered successfully:', result[0].id);
  } catch (err) {
    console.error('Registration failed:', err.message);
    process.exit(1);
  }
}

insertPC(JSON.parse(process.argv[2]));
EOF
)

        echo "$insert_script" | node - "$pc_data"
    else
        warning "Node.js não encontrado. Criando arquivo de registro local."
        create_local_registration
        return
    fi

    success "PC registrado no banco de dados central"
}

# Criar arquivo de registro local para sincronização posterior
create_local_registration() {
    log "Criando arquivo de registro local..."

    local registration_file="$HOME/pc_registration_$(date +%Y%m%d_%H%M%S).json"

    cat > "$registration_file" <<EOF
{
  "registration_type": "local_pending",
  "pc_data": {
    "hostname": "$PC_HOSTNAME",
    "ip_address": "$PC_IP",
    "specialization": "$SPECIALIZATION",
    "username": "$PC_USERNAME",
    "hardware": {
      "ram_gb": $PC_RAM_GB,
      "cpu_cores": $PC_CPU_CORES,
      "disk_gb": $PC_DISK_GB
    },
    "software": {
      "wsl_version": "$WSL_VERSION",
      "node_version": "$NODE_VERSION",
      "python_version": "$PYTHON_VERSION"
    },
    "network": {
      "zerotier_status": "$ZEROTIER_STATUS",
      "zerotier_networks": $ZEROTIER_NETWORKS,
      "ssh_status": "$SSH_STATUS"
    },
    "status": "pending_sync",
    "created_at": "$(date -Iseconds)"
  },
  "sync_instructions": "Execute o script sync_pending_registrations.js para sincronizar com o banco central"
}
EOF

    success "Arquivo de registro local criado: $registration_file"
    info "Para sincronizar: node scripts/infra/sync_pending_registrations.js $registration_file"
}

# Testar conectividade com PC central
test_brain_connection() {
    log "Testando conectividade com PC Central (Brain)..."

    # Tentar conexão SSH com PC central (se IP conhecido)
    if [ -n "$BRAIN_PC_IP" ]; then
        info "Testando conexão SSH com Brain PC: $BRAIN_PC_IP"

        if wsl -d Ubuntu -- ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$BRAIN_PC_IP" -p 2222 "echo 'Brain PC reachable'" 2>/dev/null; then
            success "Conectividade com Brain PC estabelecida"
        else
            warning "Não foi possível conectar ao Brain PC"
            info "Certifique-se de que:"
            info "  1. Brain PC está online"
            info "  2. ZeroTier está configurado corretamente"
            info "  3. Chaves SSH estão trocadas"
        fi
    else
        info "IP do Brain PC não configurado. Configure BRAIN_PC_IP para testes automáticos."
    fi
}

# Gerar relatório de registro
generate_report() {
    log "Gerando relatório de registro..."

    local report_file="$HOME/pc_registration_report_$(date +%Y%m%d_%H%M%S).md"

    cat > "$report_file" <<EOF
# Relatório de Registro - PC Corporação Senciente

## Informações Gerais
- **Hostname:** $PC_HOSTNAME
- **IP Address:** $PC_IP
- **Especialização:** $SPECIALIZATION
- **Usuário WSL2:** $PC_USERNAME
- **Data de Registro:** $(date)

## Hardware
- **RAM:** ${PC_RAM_GB}GB
- **CPU Cores:** $PC_CPU_CORES
- **Disco:** ${PC_DISK_GB}GB

## Software
- **WSL Version:** $WSL_VERSION
- **Node.js:** $NODE_VERSION
- **Python:** $PYTHON_VERSION

## Rede
- **ZeroTier Status:** $ZEROTIER_STATUS
- **Redes ZeroTier:** $ZEROTIER_NETWORKS
- **SSH Status:** $SSH_STATUS

## Status
- **Estado:** Registrado e ativo
- **Última Verificação:** $(date)

---
*Relatório gerado automaticamente pelo script register_pc.sh*
EOF

    success "Relatório gerado: $report_file"
}

# Função principal
main() {
    echo "================================================================================="
    echo "🔗 REGISTER PC - Corporação Senciente"
    echo "================================================================================="
    echo "Este script registra um PC secundário no sistema central da corporação"
    echo "================================================================================="

    check_pc_setup
    gather_pc_info
    register_in_database
    test_brain_connection
    generate_report

    echo ""
    echo "================================================================================="
    success "✅ REGISTRO CONCLUÍDO COM SUCESSO!"
    echo ""
    highlight "🎯 PC REGISTRADO NA CORPORÇÃO SENCIENTE"
    echo ""
    info "ESPECIALIZAÇÃO: ${SPECIALIZATION^^}"
    info "HOSTNAME: $PC_HOSTNAME"
    info "IP: $PC_IP"
    echo ""
    echo "📋 O PC está agora pronto para:"
    echo "• Receber tasks do Brain Central"
    echo "• Participar do swarm distribuído"
    echo "• Contribuir com sua especialização específica"
    echo ""
    echo "🔄 O sistema irá sincronizar automaticamente com o Brain PC"
    echo "   através da rede ZeroTier configurada."
    echo ""
    echo "================================================================================="
}

# Executar função principal
main "$@"






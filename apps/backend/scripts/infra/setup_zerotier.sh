#!/bin/bash

# =================================================================================
# Script de Setup ZeroTier - Rede Segura Multi-PC
# Corporação Senciente - Fase 0.5
# =================================================================================
# Configura ZeroTier automaticamente para comunicação segura entre PCs
# Cria rede privada mesh para swarm distribuído
# =================================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações - ALTERE CONFORME NECESSÁRIO
ZEROTIER_NETWORK_ID="your-network-id-here"  # ID da rede ZeroTier
ZEROTIER_API_TOKEN="your-api-token-here"   # Token da API ZeroTier

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar se está rodando no WSL2
check_wsl() {
    log "Verificando ambiente WSL2..."

    if [ ! -f /proc/version ] || ! grep -q "Microsoft" /proc/version; then
        error "Este script deve ser executado dentro do WSL2 Ubuntu"
        exit 1
    fi

    success "Ambiente WSL2 confirmado"
}

# Instalar ZeroTier
install_zerotier() {
    log "Instalando ZeroTier..."

    # Adicionar repositório ZeroTier
    curl -s https://install.zerotier.com | sudo bash

    # Verificar instalação
    if ! command -v zerotier-cli &> /dev/null; then
        error "Falha na instalação do ZeroTier"
        exit 1
    fi

    success "ZeroTier instalado com sucesso"
}

# Configurar ZeroTier
configure_zerotier() {
    log "Configurando ZeroTier..."

    # Iniciar serviço
    sudo systemctl enable zerotier-one
    sudo systemctl start zerotier-one

    # Entrar na rede da corporação
    if [ "$ZEROTIER_NETWORK_ID" != "your-network-id-here" ]; then
        log "Entrando na rede ZeroTier: $ZEROTIER_NETWORK_ID"
        sudo zerotier-cli join $ZEROTIER_NETWORK_ID

        # Aguardar autorização (manual no controller)
        info "Aguardando autorização na rede ZeroTier..."
        info "Acesse o controller ZeroTier e autorize este node"

        # Verificar status
        local attempts=0
        while [ $attempts -lt 30 ]; do
            if sudo zerotier-cli listnetworks | grep -q "$ZEROTIER_NETWORK_ID"; then
                success "Conectado à rede ZeroTier!"
                break
            fi
            sleep 2
            ((attempts++))
        done

        if [ $attempts -eq 30 ]; then
            warning "Timeout aguardando autorização. Continue manualmente:"
            echo "sudo zerotier-cli join $ZEROTIER_NETWORK_ID"
        fi
    else
        warning "ZEROTIER_NETWORK_ID não configurado. Configure manualmente:"
        echo "sudo zerotier-cli join <network-id>"
    fi

    success "ZeroTier configurado"
}

# Configurar regras de firewall para ZeroTier
configure_firewall() {
    log "Configurando firewall para ZeroTier..."

    # Permitir tráfego ZeroTier
    sudo ufw allow 9993/udp comment "ZeroTier"

    # Recarregar firewall
    sudo ufw reload

    success "Firewall configurado para ZeroTier"
}

# Obter endereço IP ZeroTier
get_zerotier_ip() {
    log "Obtendo endereço IP ZeroTier..."

    # Aguardar atribuição de IP
    local attempts=0
    while [ $attempts -lt 10 ]; do
        local zt_ip=$(sudo zerotier-cli get $ZEROTIER_NETWORK_ID ip)
        if [ ! -z "$zt_ip" ] && [ "$zt_ip" != "0.0.0.0" ]; then
            echo "$zt_ip"
            return 0
        fi
        sleep 3
        ((attempts++))
    done

    warning "IP ZeroTier ainda não atribuído. Execute novamente em alguns segundos."
    return 1
}

# Testar conectividade ZeroTier
test_zerotier() {
    log "Testando conectividade ZeroTier..."

    # Verificar status
    local status=$(sudo zerotier-cli status)
    if echo "$status" | grep -q "ONLINE"; then
        success "ZeroTier está online"
    else
        warning "ZeroTier pode não estar online completamente"
    fi

    # Listar redes
    info "Redes ZeroTier conectadas:"
    sudo zerotier-cli listnetworks

    success "Teste de conectividade concluído"
}

# Registrar PC com IP ZeroTier
update_pc_registry() {
    log "Atualizando registro do PC com IP ZeroTier..."

    local zt_ip=$(get_zerotier_ip)
    if [ $? -eq 0 ]; then
        info "IP ZeroTier atribuído: $zt_ip"

        # Criar/atualizar arquivo de configuração local
        cat > zerotier_config.json << EOF
{
  "zerotier": {
    "network_id": "$ZEROTIER_NETWORK_ID",
    "ip": "$zt_ip",
    "status": "connected"
  },
  "updated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

        success "Configuração ZeroTier salva localmente"
    else
        warning "IP ZeroTier ainda não disponível. Registro será feito quando atribuído."
    fi
}

# Função principal
main() {
    echo "================================================================================="
    echo "🔐 SETUP ZEROTIER - Corporação Senciente"
    echo "================================================================================="
    echo "Configurando rede ZeroTier para comunicação segura entre PCs"
    echo "================================================================================="

    check_wsl
    install_zerotier
    configure_zerotier
    configure_firewall
    test_zerotier
    update_pc_registry

    echo ""
    echo "================================================================================="
    success "✅ ZEROTIER CONFIGURADO COM SUCESSO!"
    echo ""
    echo "🔗 Rede ZeroTier estabelecida para swarm distribuído"
    echo ""
    echo "📋 PRÓXIMOS PASSOS:"
    echo "1. Autorize este node no controller ZeroTier (se necessário)"
    echo "2. Configure outros PCs da corporação na mesma rede"
    echo "3. Teste conectividade entre PCs: ping <zerotier-ip>"
    echo ""
    echo "🔧 COMANDOS ÚTEIS:"
    echo "   zerotier-cli status              - Status do ZeroTier"
    echo "   zerotier-cli listnetworks        - Redes conectadas"
    echo "   zerotier-cli leave <network-id>  - Sair da rede"
    echo ""
    echo "📁 ARQUIVOS CRIADOS:"
    echo "   zerotier_config.json - Configuração local ZeroTier"
    echo ""
    echo "================================================================================="

    # Exibir IP ZeroTier se disponível
    local zt_ip=$(get_zerotier_ip 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "🌐 IP ZeroTier: $zt_ip"
        echo ""
    fi
}

# Executar função principal
main "$@"







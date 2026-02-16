#!/bin/bash

# =================================================================================
# Teste de Conectividade ZeroTier - Corporação Senciente
# Fase 0.5 - Comunicação Multi-PC
# =================================================================================
# Testa conectividade entre PCs na rede ZeroTier
# Valida comunicação segura para swarm distribuído
# =================================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

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
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# Obter lista de PCs da corporação
get_corporation_pcs() {
    log "Obtendo lista de PCs registrados..."

    # Tentar obter da API do PC Registry
    if curl -s http://localhost:3001/api/pcs/status > /dev/null 2>&1; then
        local pcs_response=$(curl -s http://localhost:3001/api/pcs/status)
        echo "$pcs_response" | grep -o '"ip":"[^"]*"' | cut -d'"' -f4
    else
        warning "API do PC Registry não disponível. Usando lista local..."

        # Fallback: procurar arquivos de configuração locais
        find /home -name "pc_config.json" 2>/dev/null | head -10 | while read config_file; do
            if [ -f "$config_file" ]; then
                grep -o '"ip":"[^"]*"' "$config_file" 2>/dev/null | cut -d'"' -f4
            fi
        done
    fi
}

# Obter IP ZeroTier local
get_local_zerotier_ip() {
    # Verificar se ZeroTier está instalado e conectado
    if command -v zerotier-cli &> /dev/null; then
        sudo zerotier-cli listnetworks | grep -v "Network ID" | while read line; do
            local network_id=$(echo $line | awk '{print $3}')
            local zt_ip=$(sudo zerotier-cli get $network_id ip 2>/dev/null)
            if [ ! -z "$zt_ip" ] && [ "$zt_ip" != "0.0.0.0" ]; then
                echo "$zt_ip"
                return 0
            fi
        done
    fi

    # Fallback: ler do arquivo de configuração
    if [ -f "zerotier_config.json" ]; then
        grep -o '"ip":"[^"]*"' zerotier_config.json 2>/dev/null | cut -d'"' -f4
    fi

    return 1
}

# Testar conectividade básica
test_basic_connectivity() {
    local target_ip=$1

    log "Testando conectividade básica com $target_ip..."

    # Ping básico
    if ping -c 3 -W 2 $target_ip > /dev/null 2>&1; then
        success "Ping para $target_ip - OK"
        return 0
    else
        warning "Ping para $target_ip - FALHA"
        return 1
    fi
}

# Testar conectividade SSH
test_ssh_connectivity() {
    local target_ip=$1

    log "Testando conectividade SSH com $target_ip..."

    # Testar SSH sem senha (usando chave)
    if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -o PasswordAuthentication=no \
           -p 2222 brain@$target_ip "echo 'SSH test successful'" > /dev/null 2>&1; then
        success "SSH para $target_ip - OK"
        return 0
    else
        warning "SSH para $target_ip - FALHA (verifique chaves SSH)"
        return 1
    fi
}

# Testar comunicação específica da corporação
test_corporation_services() {
    local target_ip=$1

    log "Testando serviços da corporação em $target_ip..."

    local tests_passed=0
    local total_tests=0

    # Testar se PC tem arquivo de configuração da corporação
    ((total_tests++))
    if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -p 2222 brain@$target_ip \
           "test -f /home/brain/.corporacao-senciente && echo 'found'" 2>/dev/null | grep -q "found"; then
        success "Arquivo corporação encontrado em $target_ip"
        ((tests_passed++))
    else
        warning "Arquivo corporação não encontrado em $target_ip"
    fi

    # Testar se PC está rodando serviços Node.js (se aplicável)
    ((total_tests++))
    if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -p 2222 brain@$target_ip \
           "pgrep node > /dev/null && echo 'running'" 2>/dev/null | grep -q "running"; then
        success "Serviços Node.js rodando em $target_ip"
        ((tests_passed++))
    else
        info "Nenhum serviço Node.js detectado em $target_ip (normal para PCs não-Brain)"
    fi

    info "Serviços testados: $tests_passed/$total_tests passaram"
    return $((total_tests - tests_passed))
}

# Testar latência de rede
test_network_latency() {
    local target_ip=$1

    log "Testando latência de rede para $target_ip..."

    local ping_result=$(ping -c 5 -W 1 $target_ip 2>/dev/null | tail -1 | awk '{print $4}' | cut -d'/' -f2)

    if [ ! -z "$ping_result" ]; then
        local latency_ms=$(echo "$ping_result * 1000" | bc 2>/dev/null | xargs printf "%.0f")
        if [ "$latency_ms" -lt 50 ]; then
            success "Latência baixa: ${latency_ms}ms"
        elif [ "$latency_ms" -lt 200 ]; then
            info "Latência média: ${latency_ms}ms"
        else
            warning "Latência alta: ${latency_ms}ms"
        fi
    else
        warning "Não foi possível medir latência"
    fi
}

# Executar testes completos para um PC
test_pc_communication() {
    local target_ip=$1
    local pc_name=${2:-"PC-$target_ip"}

    echo ""
    echo "=================================================================="
    info "TESTANDO COMUNICAÇÃO COM: $pc_name ($target_ip)"
    echo "=================================================================="

    local connectivity_score=0
    local max_score=4

    # Teste 1: Conectividade básica
    if test_basic_connectivity $target_ip; then
        ((connectivity_score++))
    fi

    # Teste 2: SSH
    if test_ssh_connectivity $target_ip; then
        ((connectivity_score++))
    fi

    # Teste 3: Serviços da corporação
    if test_corporation_services $target_ip; then
        ((connectivity_score++))
    fi

    # Teste 4: Latência
    test_network_latency $target_ip
    ((connectivity_score++))  # Sempre conta como passou

    echo ""
    info "SCORE DE CONECTIVIDADE: $connectivity_score/$max_score"

    case $connectivity_score in
        4) success "EXCELENTE - Comunicação totalmente funcional" ;;
        3) success "BOA - Comunicação funcional com pequenas limitações" ;;
        2) warning "REGULAR - Comunicação básica funcionando" ;;
        1) warning "RUIM - Apenas conectividade básica" ;;
        0) error "CRÍTICA - Sem comunicação" ;;
    esac

    return $((max_score - connectivity_score))
}

# Testar comunicação com todos os PCs
test_all_pcs() {
    local local_zt_ip=$(get_local_zerotier_ip)

    if [ -z "$local_zt_ip" ]; then
        error "IP ZeroTier local não encontrado. Execute setup_zerotier.sh primeiro."
        exit 1
    fi

    info "IP ZeroTier local: $local_zt_ip"

    local pcs_list=$(get_corporation_pcs)
    local total_pcs=$(echo "$pcs_list" | wc -l)
    local successful_tests=0

    if [ -z "$pcs_list" ]; then
        warning "Nenhum PC registrado encontrado. Testando apenas conectividade básica..."
        return 1
    fi

    info "Encontrados $total_pcs PCs para teste"

    for pc_ip in $pcs_list; do
        # Pular IP local
        if [ "$pc_ip" = "$local_zt_ip" ]; then
            info "Pulando teste com IP local ($pc_ip)"
            continue
        fi

        if test_pc_communication $pc_ip; then
            ((successful_tests++))
        fi
    done

    echo ""
    echo "=================================================================="
    success "RESUMO DOS TESTES: $successful_tests/$total_pcs PCs com comunicação funcional"
    echo "=================================================================="

    return $((total_pcs - successful_tests))
}

# Função principal
main() {
    echo "================================================================================="
    echo "🔗 TESTE DE CONECTIVIDADE ZEROTIER - Corporação Senciente"
    echo "================================================================================="
    echo "Testando comunicação segura entre PCs na rede ZeroTier"
    echo "================================================================================="

    # Verificar se ZeroTier está instalado
    if ! command -v zerotier-cli &> /dev/null; then
        error "ZeroTier não está instalado. Execute setup_zerotier.sh primeiro."
        exit 1
    fi

    # Verificar se está conectado a alguma rede
    if ! sudo zerotier-cli listnetworks | grep -q "OK"; then
        warning "ZeroTier não está conectado a nenhuma rede."
        info "Execute: sudo zerotier-cli join <network-id>"
        exit 1
    fi

    success "ZeroTier está instalado e conectado"

    # Executar testes
    local test_result=0

    if [ "$1" = "--all" ] || [ -z "$1" ]; then
        test_all_pcs
        test_result=$?
    elif [[ $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        test_pc_communication $1 "PC-Teste"
        test_result=$?
    else
        echo "Uso:"
        echo "  $0                    - Testar todos os PCs registrados"
        echo "  $0 --all             - Testar todos os PCs registrados"
        echo "  $0 <ip-address>      - Testar PC específico"
        exit 1
    fi

    echo ""
    echo "================================================================================="

    if [ $test_result -eq 0 ]; then
        success "✅ TODOS OS TESTES PASSARAM!"
        echo "🎉 Rede ZeroTier funcionando perfeitamente para swarm distribuído"
    else
        warning "⚠️  Alguns testes falharam. Verifique conectividade e configurações."
        echo "💡 Dicas de troubleshooting:"
        echo "   - Verifique se todos os PCs estão autorizados na rede ZeroTier"
        echo "   - Confirme que chaves SSH estão configuradas corretamente"
        echo "   - Teste conectividade básica: ping <zerotier-ip>"
    fi

    echo "================================================================================="

    exit $test_result
}

# Executar função principal
main "$@"







#!/bin/bash

# Script para iniciar o ambiente de desenvolvimento do AURA Bot
# Autor: Sistema AURA
# Versão: 1.0.0

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado. Por favor, instale o Docker primeiro."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
        exit 1
    fi

    # Verificar se Docker está rodando
    if ! docker info &> /dev/null; then
        error "Docker não está rodando. Por favor, inicie o Docker primeiro."
        exit 1
    fi
}

# Verificar se as portas estão disponíveis
check_ports() {
    local ports=("13000" "13001" "15432" "16379" "18080" "19090" "13002")
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            warn "Porta $port já está em uso. Verifique se não há outro serviço rodando."
        fi
    done
}

# Parar containers existentes
stop_existing() {
    log "Parando containers existentes..."
    docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
    docker-compose -f docker-compose.yml down --remove-orphans 2>/dev/null || true
}

# Limpar volumes (opcional)
clean_volumes() {
    if [ "$1" = "--clean" ]; then
        log "Limpando volumes..."
        docker volume prune -f
        docker system prune -f
    fi
}

# Construir imagens
build_images() {
    log "Construindo imagens Docker..."
    docker-compose -f docker-compose.dev.yml build --no-cache
}

# Iniciar serviços
start_services() {
    log "Iniciando serviços..."
    docker-compose -f docker-compose.dev.yml up -d
    
    log "Aguardando serviços ficarem prontos..."
    sleep 10
}

# Verificar saúde dos serviços
check_health() {
    log "Verificando saúde dos serviços..."
    
    # Aguardar PostgreSQL
    log "Aguardando PostgreSQL..."
    timeout 60 bash -c 'until docker exec aura-postgres-dev pg_isready -U aura_user -d aura_db_dev; do sleep 2; done'
    
    # Aguardar Redis
    log "Aguardando Redis..."
    timeout 30 bash -c 'until docker exec aura-redis-dev redis-cli ping; do sleep 2; done'
    
    # Aguardar Backend
    log "Aguardando Backend..."
    timeout 60 bash -c 'until curl -f http://localhost:13001/api/v1/health; do sleep 3; done'
    
    # Aguardar Frontend
    log "Aguardando Frontend..."
    timeout 60 bash -c 'until curl -f http://localhost:13000; do sleep 3; done'
}

# Mostrar status
show_status() {
    log "Status dos serviços:"
    docker-compose -f docker-compose.dev.yml ps
    
    echo ""
    log "URLs de acesso:"
    echo -e "${BLUE}Frontend:${NC} http://localhost:13000"
    echo -e "${BLUE}Backend API:${NC} http://localhost:13001"
    echo -e "${BLUE}Nginx Proxy:${NC} http://localhost:18080"
    echo -e "${BLUE}Prometheus:${NC} http://localhost:19090"
    echo -e "${BLUE}Grafana:${NC} http://localhost:13002 (admin/admin)"
    echo -e "${BLUE}PostgreSQL:${NC} localhost:15432"
    echo -e "${BLUE}Redis:${NC} localhost:16379"
    
    echo ""
    log "Comandos úteis:"
    echo -e "${YELLOW}Ver logs:${NC} docker-compose -f docker-compose.dev.yml logs -f"
    echo -e "${YELLOW}Parar serviços:${NC} docker-compose -f docker-compose.dev.yml down"
    echo -e "${YELLOW}Reiniciar backend:${NC} docker-compose -f docker-compose.dev.yml restart backend"
    echo -e "${YELLOW}Reiniciar frontend:${NC} docker-compose -f docker-compose.dev.yml restart frontend"
}

# Função principal
main() {
    log "=== Iniciando Ambiente de Desenvolvimento AURA Bot ==="
    
    check_docker
    check_ports
    stop_existing
    clean_volumes "$1"
    build_images
    start_services
    check_health
    show_status
    
    log "=== Ambiente de desenvolvimento iniciado com sucesso! ==="
    log "O hot-reload está ativo. Faça alterações nos arquivos e veja as mudanças em tempo real."
}

# Executar função principal
main "$@"

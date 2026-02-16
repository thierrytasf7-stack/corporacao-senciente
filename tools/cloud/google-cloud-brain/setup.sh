#!/bin/bash
# ==============================================================================
# CORPORACAO SENCIENTE - Google Cloud Brain Setup Script
# Obtem IP Tailscale e prepara ambiente para deploy
# ==============================================================================

set -e

echo "=== CORPORACAO SENCIENTE - Google Cloud Brain Setup ==="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERRO: Docker nao encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker encontrado${NC}"

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}ERRO: Docker Compose nao encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose encontrado${NC}"

# Verificar Tailscale
TAILSCALE_IP=""
if command -v tailscale &> /dev/null; then
    echo -e "${CYAN}Obtendo IP Tailscale...${NC}"
    TAILSCALE_IP=$(tailscale ip -4 2>/dev/null || echo "")
    
    if [ -n "$TAILSCALE_IP" ]; then
        echo -e "${GREEN}✓ IP Tailscale: ${TAILSCALE_IP}${NC}"
    else
        echo -e "${YELLOW}⚠ Tailscale instalado mas IP nao encontrado${NC}"
        echo -e "${YELLOW}  Execute: tailscale up${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Tailscale nao encontrado${NC}"
    echo -e "${YELLOW}  Instale: https://tailscale.com/download${NC}"
fi

# Verificar Portainer
PORTAINER_RUNNING=$(docker ps --format "{{.Names}}" | grep -i portainer || echo "")
if [ -n "$PORTAINER_RUNNING" ]; then
    echo -e "${GREEN}✓ Portainer rodando: ${PORTAINER_RUNNING}${NC}"
else
    echo -e "${YELLOW}⚠ Portainer nao encontrado rodando${NC}"
fi

# Criar .env se nao existir
if [ ! -f ".env" ]; then
    echo -e "${CYAN}Criando arquivo .env...${NC}"
    cat > .env << EOF
# Google Cloud Brain - Environment Variables
# Gerado automaticamente por setup.sh

# Tailscale IP (obtido automaticamente)
TAILSCALE_IP=${TAILSCALE_IP}

# Notificacoes (opcional)
TELEGRAM_BOT_TOKEN=
DISCORD_WEBHOOK_URL=

# Redis (padrao)
REDIS_URL=redis://redis:6379

# Heartbeat
HEARTBEAT_INTERVAL=10
HEARTBEAT_MISS_THRESHOLD=3
EOF
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
else
    echo -e "${YELLOW}⚠ Arquivo .env ja existe${NC}"
    
    # Atualizar TAILSCALE_IP se vazio
    if [ -n "$TAILSCALE_IP" ]; then
        if grep -q "^TAILSCALE_IP=" .env; then
            sed -i "s/^TAILSCALE_IP=.*/TAILSCALE_IP=${TAILSCALE_IP}/" .env
            echo -e "${GREEN}✓ TAILSCALE_IP atualizado no .env${NC}"
        else
            echo "TAILSCALE_IP=${TAILSCALE_IP}" >> .env
            echo -e "${GREEN}✓ TAILSCALE_IP adicionado ao .env${NC}"
        fi
    fi
fi

# Verificar memoria disponivel
TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
AVAILABLE_MEM=$(free -m | awk '/^Mem:/{print $7}')

echo ""
echo -e "${CYAN}Informacoes do Sistema:${NC}"
echo "  Memoria Total: ${TOTAL_MEM}MB"
echo "  Memoria Disponivel: ${AVAILABLE_MEM}MB"

if [ "$AVAILABLE_MEM" -lt 500 ]; then
    echo -e "${YELLOW}⚠ Pouca memoria disponivel (< 500MB)${NC}"
    echo -e "${YELLOW}  O stack precisa de ~400MB para rodar${NC}"
else
    echo -e "${GREEN}✓ Memoria suficiente${NC}"
fi

# Verificar disco
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
echo "  Uso de Disco: ${DISK_USAGE}%"

if [ "$DISK_USAGE" -gt 80 ]; then
    echo -e "${YELLOW}⚠ Disco quase cheio (> 80%)${NC}"
else
    echo -e "${GREEN}✓ Espaco em disco suficiente${NC}"
fi

# Resumo
echo ""
echo -e "${GREEN}=== Setup Completo! ===${NC}"
echo ""
echo -e "${CYAN}Proximos passos:${NC}"
echo "1. Revise o arquivo .env e configure as variaveis necessarias"
echo "2. Acesse o Portainer em: https://${TAILSCALE_IP:-localhost}:9443"
echo "3. Crie uma nova Stack usando o docker-compose.yml"
echo "4. Configure os Agent Listeners nos PCs locais com:"
echo "   MAESTRO_URL=http://${TAILSCALE_IP:-SEU_IP_TAILSCALE}:8080"
echo ""
echo -e "${CYAN}Para deploy manual (sem Portainer):${NC}"
echo "  docker compose up -d"
echo ""

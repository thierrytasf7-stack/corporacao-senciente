#!/bin/bash
# ==============================================================================
# CORPORACAO SENCIENTE - Agent Listener Setup Script
# ==============================================================================

set -e

echo "=== CORPORACAO SENCIENTE - Agent Listener Setup ==="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}ERRO: Python 3 não encontrado${NC}"
    echo "Instale Python 3.12+ primeiro"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo -e "${GREEN}Python encontrado: ${PYTHON_VERSION}${NC}"

# Criar venv
if [ ! -d "venv" ]; then
    echo -e "${CYAN}Criando ambiente virtual...${NC}"
    python3 -m venv venv
fi

# Ativar venv
source venv/bin/activate

# Instalar dependências
echo -e "${CYAN}Instalando dependências...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Criar .env se não existir
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Criando arquivo .env...${NC}"
    cat > .env << EOF
# Maestro URL (Oracle VPS ou local)
MAESTRO_URL=https://api.senciente.corp

# Agent ID (identificador único)
AGENT_ID=$(hostname)

# Agent Name (nome amigável)
AGENT_NAME=$(hostname)

# Heartbeat interval (segundos)
HEARTBEAT_INTERVAL=10

# Reconnect delay (segundos)
RECONNECT_DELAY=5
EOF
    echo -e "${GREEN}Arquivo .env criado. Configure as variáveis conforme necessário.${NC}"
fi

# Criar diretório de logs
mkdir -p logs

echo ""
echo -e "${GREEN}=== Setup completo! ===${NC}"
echo ""
echo -e "${CYAN}Próximos passos:${NC}"
echo "1. Edite o arquivo .env com suas configurações"
echo "2. Execute: source venv/bin/activate && python listener.py"
echo ""
echo -e "${YELLOW}Para rodar como serviço systemd:${NC}"
echo "sudo cp agent-listener.service /etc/systemd/system/"
echo "sudo systemctl enable agent-listener"
echo "sudo systemctl start agent-listener"

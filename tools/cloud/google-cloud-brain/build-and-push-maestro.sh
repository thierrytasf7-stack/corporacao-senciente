#!/bin/bash
# ==============================================================================
# CORPORACAO SENCIENTE - Build and Push Maestro Image
# Script para fazer build local e push para GitHub Container Registry
# ==============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "=== CORPORACAO SENCIENTE - Build and Push Maestro ==="
echo ""

# Solicitar informações
read -p "Digite seu usuário do GitHub: " GITHUB_USER
read -p "Digite o nome do repositório (ex: diana-corporacao-senciente): " REPO_NAME

if [ -z "$GITHUB_USER" ] || [ -z "$REPO_NAME" ]; then
    echo -e "${RED}ERRO: Usuário e repositório são obrigatórios${NC}"
    exit 1
fi

IMAGE_NAME="ghcr.io/${GITHUB_USER}/${REPO_NAME}-maestro"
IMAGE_TAG="latest"

echo ""
echo -e "${CYAN}Configuração:${NC}"
echo "  Imagem: ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""

# Verificar se está logado no GitHub Container Registry
echo -e "${CYAN}Verificando login no GitHub Container Registry...${NC}"
if ! echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USER" --password-stdin 2>/dev/null; then
    echo -e "${YELLOW}Você precisa fazer login no GitHub Container Registry${NC}"
    echo "Crie um Personal Access Token (PAT) com permissão 'write:packages'"
    echo "Em: https://github.com/settings/tokens"
    echo ""
    read -sp "Digite seu GitHub Personal Access Token: " GITHUB_TOKEN
    echo ""
    
    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}ERRO: Token é obrigatório${NC}"
        exit 1
    fi
    
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USER" --password-stdin
fi

# Navegar para pasta do maestro
cd maestro || {
    echo -e "${RED}ERRO: Pasta maestro não encontrada${NC}"
    exit 1
}

# Build da imagem
echo ""
echo -e "${CYAN}Fazendo build da imagem...${NC}"
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

# Push da imagem
echo ""
echo -e "${CYAN}Fazendo push da imagem...${NC}"
docker push "${IMAGE_NAME}:${IMAGE_TAG}"

echo ""
echo -e "${GREEN}=== Build e Push Completo! ===${NC}"
echo ""
echo -e "${CYAN}Próximos passos:${NC}"
echo "1. No Portainer, use o arquivo docker-compose.production.yml"
echo "2. Altere a linha do image do maestro para:"
echo "   image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo "3. Deploy a stack"
echo ""

#!/bin/bash
# Script de Preparação do GCloud para WhatsApp Bridge
# Corporação Senciente - Deploy Maestro WhatsApp

set -e

echo "🦅 [Maestro Deploy] Iniciando preparação do ambiente GCloud..."

# 1. Ativar SWAP (2GB)
echo "💾 [1/5] Configurando SWAP..."
if ! grep -q "swapfile" /etc/fstab; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo "/swapfile none swap sw 0 0" | sudo tee -a /etc/fstab
    echo "✅ SWAP 2GB ativado"
else
    echo "✅ SWAP já configurado"
fi

# 2. Instalar dependências do sistema
echo "📦 [2/5] Instalando dependências..."
sudo apt-get update
sudo apt-get install -y \
    chromium \
    chromium-driver \
    libnss3 \
    libfreetype6 \
    libharfbuzz-bin \
    ca-certificates \
    fonts-freefont-ttf \
    tzdata

# 3. Configurar timezone
echo "🌍 [3/5] Configurando timezone..."
sudo timedatectl set-timezone America/Sao_Paulo

# 4. Criar diretórios
echo "📁 [4/5] Criando estrutura de diretórios..."
mkdir -p ~/maestro-whatsapp/{auth_info,logs}

# 5. Verificar Docker
echo "🐳 [5/5] Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "⚠️ Docker não encontrado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado"
else
    echo "✅ Docker já instalado"
fi

echo ""
echo "🎉 Ambiente GCloud preparado com sucesso!"
echo ""
echo "📊 Status:"
free -h
echo ""
echo "🚀 Próximos passos:"
echo "1. Fazer upload do código (git clone ou scp)"
echo "2. Configurar .env com AUTHORIZED_NUMBERS"
echo "3. Rodar: docker-compose up -d"

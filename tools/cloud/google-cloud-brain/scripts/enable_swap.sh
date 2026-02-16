#!/bin/bash
# Script de Ativação de SWAP para e2-micro (Google Cloud)
# Corporação Senciente - Infraestrutura

SWAP_FILE="/swapfile"
SWAP_SIZE="2G"

echo "🦅 [Maestro Infra] Verificando existência de SWAP..."

if grep -q "swapfile" /etc/fstab; then
    echo "✅ SWAP já configurado no /etc/fstab."
    free -h
    exit 0
fi

echo "⏳ Criando arquivo de SWAP de ${SWAP_SIZE}..."
sudo fallocate -l $SWAP_SIZE $SWAP_FILE || sudo dd if=/dev/zero of=$SWAP_FILE bs=1024 count=2097152

echo "🔒 Ajustando permissões..."
sudo chmod 600 $SWAP_FILE

echo "🛠️ Formatando como SWAP..."
sudo mkswap $SWAP_FILE

echo "🚀 Ativando SWAP..."
sudo swapon $SWAP_FILE

echo "💾 Persistindo no fstab..."
echo "$SWAP_FILE none swap sw 0 0" | sudo tee -a /etc/fstab

echo "✅ SWAP 2GB Ativado com Sucesso! (Blindagem contra OOM Kill)"
echo "📊 Nova Memória:"
free -h

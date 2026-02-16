#!/bin/bash
# ==============================================================================
# CORPORACAO SENCIENTE - Configurar Cloudflare Tunnel para Maestro
# Execute no servidor Google Cloud (SSH)
# ==============================================================================

set -e

echo "=== CONFIGURANDO CLOUDFLARE TUNNEL ==="
echo ""

# Verificar se está rodando como root ou com sudo
if [ "$EUID" -ne 0 ]; then 
    echo "AVISO: Este script precisa de privilégios sudo"
    echo "Execute: sudo bash CONFIGURAR_CLOUDFLARE_TUNNEL.sh"
    exit 1
fi

# 1. Instalar cloudflared
echo "1. Verificando cloudflared..."
if command -v cloudflared &> /dev/null; then
    echo "   ✓ cloudflared já instalado"
    cloudflared --version
else
    echo "   Instalando cloudflared..."
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
    chmod +x /tmp/cloudflared
    mv /tmp/cloudflared /usr/local/bin/cloudflared
    echo "   ✓ cloudflared instalado"
    cloudflared --version
fi

echo ""

# 2. Criar serviço systemd para manter tunnel rodando
echo "2. Configurando serviço systemd..."
SERVICE_FILE="/etc/systemd/system/cloudflared-tunnel.service"

cat > "$SERVICE_FILE" << 'EOF'
[Unit]
Description=Cloudflare Tunnel para Maestro
After=network.target docker.service

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --url http://localhost:8080
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

echo "   ✓ Arquivo de serviço criado: $SERVICE_FILE"
echo ""

# 3. Recarregar systemd e iniciar serviço
echo "3. Iniciando serviço..."
systemctl daemon-reload
systemctl enable cloudflared-tunnel.service
systemctl start cloudflared-tunnel.service

echo "   ✓ Serviço iniciado"
echo ""

# 4. Aguardar alguns segundos e verificar status
echo "4. Verificando status do tunnel..."
sleep 5

if systemctl is-active --quiet cloudflared-tunnel.service; then
    echo "   ✓ Serviço está rodando"
else
    echo "   X Serviço não está rodando"
    echo "   Verificando logs..."
    journalctl -u cloudflared-tunnel.service -n 20 --no-pager
    exit 1
fi

echo ""

# 5. Obter URL do tunnel
echo "5. Obtendo URL do tunnel..."
sleep 3

# Tentar obter URL dos logs
TUNNEL_URL=$(journalctl -u cloudflared-tunnel.service -n 50 --no-pager | grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' | head -1)

if [ -z "$TUNNEL_URL" ]; then
    echo "   AVISO: URL não encontrada nos logs automaticamente"
    echo "   Verifique manualmente:"
    echo "   journalctl -u cloudflared-tunnel.service -f"
    echo ""
    echo "   Procure por uma linha como:"
    echo "   https://xxxxx.trycloudflare.com"
else
    echo "   ✓ URL encontrada: $TUNNEL_URL"
fi

echo ""
echo "=== CONFIGURAÇÃO COMPLETA ==="
echo ""
echo "Próximos passos:"
echo ""
echo "1. Se a URL não apareceu acima, verifique os logs:"
echo "   journalctl -u cloudflared-tunnel.service -f"
echo ""
echo "2. Copie a URL HTTPS gerada (ex: https://xxxxx.trycloudflare.com)"
echo ""
echo "3. Atualize NEXT_PUBLIC_MAESTRO_URL no Vercel:"
echo "   - Dashboard: https://vercel.com/dashboard"
echo "   - Settings > Environment Variables"
echo "   - Editar NEXT_PUBLIC_MAESTRO_URL"
echo "   - Valor: URL do tunnel (HTTPS)"
echo ""
echo "4. Fazer novo deploy:"
echo "   cd mission-control"
echo "   npx vercel --prod"
echo ""
echo "5. Verificar status do serviço:"
echo "   sudo systemctl status cloudflared-tunnel.service"
echo ""
echo "6. Ver logs em tempo real:"
echo "   sudo journalctl -u cloudflared-tunnel.service -f"
echo ""

if [ -n "$TUNNEL_URL" ]; then
    echo "=== URL DO TUNNEL ==="
    echo "$TUNNEL_URL"
    echo ""
    echo "Copie esta URL e atualize no Vercel!"
fi

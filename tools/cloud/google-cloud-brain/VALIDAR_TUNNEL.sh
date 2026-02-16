#!/bin/bash
# ==============================================================================
# CORPORACAO SENCIENTE - Validar Cloudflare Tunnel
# Verifica se o tunnel está funcionando corretamente
# ==============================================================================

echo "=== VALIDANDO CLOUDFLARE TUNNEL ==="
echo ""

# 1. Verificar se serviço está rodando
echo "1. Verificando serviço..."
if systemctl is-active --quiet cloudflared-tunnel.service; then
    echo "   ✓ Serviço está rodando"
else
    echo "   X Serviço NÃO está rodando"
    echo "   Iniciar: sudo systemctl start cloudflared-tunnel.service"
    exit 1
fi

echo ""

# 2. Obter URL do tunnel
echo "2. Obtendo URL do tunnel..."
TUNNEL_URL=$(journalctl -u cloudflared-tunnel.service -n 100 --no-pager | grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' | head -1)

if [ -z "$TUNNEL_URL" ]; then
    echo "   X URL não encontrada"
    echo "   Verifique os logs: journalctl -u cloudflared-tunnel.service -n 50"
    exit 1
else
    echo "   ✓ URL: $TUNNEL_URL"
fi

echo ""

# 3. Testar conexão HTTP
echo "3. Testando conexão HTTP..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TUNNEL_URL/health" --max-time 10 || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✓ Health check OK (Status: $HTTP_STATUS)"
else
    echo "   X Health check falhou (Status: $HTTP_STATUS)"
    echo "   Verifique se Maestro está rodando: docker ps | grep maestro"
fi

echo ""

# 4. Testar CORS
echo "4. Verificando CORS..."
CORS_HEADER=$(curl -s -I "$TUNNEL_URL/health" --max-time 10 | grep -i "access-control-allow-origin" || echo "")

if [ -n "$CORS_HEADER" ]; then
    echo "   ✓ CORS configurado: $CORS_HEADER"
else
    echo "   X CORS não encontrado"
    echo "   Verifique se Maestro foi reiniciado após adicionar CORS"
fi

echo ""

# 5. Testar endpoint de agentes
echo "5. Testando endpoint /agents..."
AGENTS_RESPONSE=$(curl -s "$TUNNEL_URL/agents" --max-time 10 || echo "")

if [ -n "$AGENTS_RESPONSE" ] && echo "$AGENTS_RESPONSE" | grep -q "agents"; then
    echo "   ✓ Endpoint /agents funcionando"
    AGENT_COUNT=$(echo "$AGENTS_RESPONSE" | grep -o '"agent_id"' | wc -l)
    echo "   Agentes encontrados: $AGENT_COUNT"
else
    echo "   X Endpoint /agents falhou"
fi

echo ""
echo "=== RESUMO ==="
echo ""
echo "URL do Tunnel: $TUNNEL_URL"
echo ""
echo "Se todos os testes passaram:"
echo "  1. Atualize NEXT_PUBLIC_MAESTRO_URL no Vercel com: $TUNNEL_URL"
echo "  2. Faça novo deploy do Mission Control"
echo "  3. Teste a conexão no navegador"
echo ""

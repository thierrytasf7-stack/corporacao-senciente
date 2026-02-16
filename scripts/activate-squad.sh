#!/bin/bash
# Activate Software Inc Squad in AIOS

echo "=== ATIVANDO SOFTWARE INC SQUAD ==="
echo ""

# Check if AIOS is running
if ! command -v aios-core &> /dev/null; then
    echo "❌ AIOS Core não encontrado. Instale com: npx aios-core install"
    exit 1
fi

echo "1️⃣ Registrando squad..."
aios-core squad register squads/software-inc-squad --name "software-inc-squad"

echo ""
echo "2️⃣ Ativando agentes..."
aios-core agent activate monitor-agent
aios-core agent activate event-agent
aios-core agent activate analytics-agent

echo ""
echo "3️⃣ Iniciando squad..."
aios-core squad activate software-inc-squad

echo ""
echo "4️⃣ Verificando status..."
aios-core squad status software-inc-squad

echo ""
echo "5️⃣ Testando conexão com jogo..."
if [ -f "C:/AIOS/agent_status.json" ]; then
    echo "✅ Arquivo de status encontrado"
    echo ""
    echo "Status atual:"
    cat C:/AIOS/agent_status.json | jq '.' 2>/dev/null || cat C:/AIOS/agent_status.json
else
    echo "⚠️  Arquivo de status não encontrado ainda"
fi

echo ""
echo "✅ SQUAD ATIVADA COM SUCESSO!"
echo ""
echo "Próximos passos:"
echo "1. Iniciar Software Inc"
echo "2. Verificar console para: '[AIOS Bridge] Mod loaded successfully'"
echo "3. Monitorar: watch -n 1 'cat C:/AIOS/agent_status.json | jq'"

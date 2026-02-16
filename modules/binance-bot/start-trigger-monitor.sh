#!/bin/bash

echo "🚀 Iniciando Monitor de Gatilhos AURA..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker primeiro."
    exit 1
fi

# Verificar se o backend está rodando
if ! curl -s http://127.0.0.1:23231/api/v1/binance/test-connection > /dev/null; then
    echo "❌ Backend AURA não está rodando. Inicie o backend primeiro."
    exit 1
fi

# Construir e executar o container do monitor de gatilhos
echo "🔨 Construindo container do monitor de gatilhos..."
docker-compose -f docker-compose.triggers.yml up --build -d

echo "✅ Monitor de gatilhos iniciado!"
echo "📊 Para ver os logs: docker logs -f aura-trigger-monitor"
echo "🛑 Para parar: docker-compose -f docker-compose.triggers.yml down"


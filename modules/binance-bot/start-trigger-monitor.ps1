Write-Host "🚀 Iniciando Monitor de Gatilhos AURA..." -ForegroundColor Green

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
}
catch {
    Write-Host "❌ Docker não está rodando. Inicie o Docker primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o backend está rodando
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:23231/api/v1/binance/test-connection" -Method GET -TimeoutSec 5
}
catch {
    Write-Host "❌ Backend AURA não está rodando. Inicie o backend primeiro." -ForegroundColor Red
    exit 1
}

# Construir e executar o container do monitor de gatilhos
Write-Host "🔨 Construindo container do monitor de gatilhos..." -ForegroundColor Yellow
docker-compose -f docker-compose.triggers.yml up --build -d

Write-Host "✅ Monitor de gatilhos iniciado!" -ForegroundColor Green
Write-Host "📊 Para ver os logs: docker logs -f aura-trigger-monitor" -ForegroundColor Cyan
Write-Host "🛑 Para parar: docker-compose -f docker-compose.triggers.yml down" -ForegroundColor Cyan


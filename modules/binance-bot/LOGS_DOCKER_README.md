# Sistema de Logs Docker - AURA BOT

## 🐳 Sistema Docker Implementado

O sistema agora captura logs **REAIS** diretamente dos containers Docker, usando as portas corretas detectadas pelo MCP.

## 🚀 Como Usar

### Opção 1: Script Docker (Recomendado)
```bash
# Captura única
py docker_real_logger.py

# Captura contínua (a cada 15 segundos)
py docker_real_logger.py --continuous 15
```

### Opção 2: Scripts de Inicialização Docker
```bash
# Windows Batch
start_docker_logging.bat

# PowerShell
.\start_docker_logging.ps1
```

## 📊 Portas Docker Detectadas

| Serviço | Container | Porta Externa | Porta Interna | Status |
|---------|-----------|---------------|---------------|---------|
| **Frontend** | `aura-binance-frontend-dev` | `13000` | `3000` | ✅ Ativo |
| **Backend** | `aura-binance-backend-dev` | `13001` | `3001` | ✅ Ativo |
| **PostgreSQL** | `aura-binance-postgres-dev` | `15432` | `5432` | ✅ Ativo |
| **Redis** | `aura-binance-redis-dev` | `16379` | `6379` | ✅ Ativo |
| **MCP Bridge** | `mcp-bridge` | `8080` | `8080` | ✅ Ativo |

## 🔍 O que é Capturado

### Logs dos Containers Docker
- ✅ Status dos containers (Up/Down)
- ✅ Logs em tempo real dos containers
- ✅ Health checks dos serviços
- ✅ Informações de rede dos containers

### Verificações de Conectividade
- ✅ Frontend: `http://localhost:13000`
- ✅ Backend Health: `http://localhost:13001/health`
- ✅ API de Logs: `http://localhost:13001/api/logs/test`
- ✅ Uso das portas no sistema

### Logs Específicos dos Containers
- ✅ Logs do frontend (Vite/React)
- ✅ Logs do backend (Node.js/Express)
- ✅ Status do PostgreSQL
- ✅ Status do Redis

## 📁 Arquivo de Saída

O sistema atualiza o arquivo `LOGS-CONSOLE-FRONTEND.JSON` com dados reais do Docker:

```json
{
    "sessionId": "docker_session_1755563855",
    "startTime": "2025-08-18T21:37:35.429215",
    "endTime": "2025-08-18T21:37:36.501963",
    "totalLogs": 15,
    "errors": 0,
    "warnings": 0,
    "logs": [
        {
            "timestamp": "2025-08-18T21:37:35.430216",
            "level": "info",
            "message": "Container aura-binance-frontend-dev - Status: Up",
            "url": "docker://e65021a49aa3",
            "source": "docker"
        },
        {
            "timestamp": "2025-08-18T21:37:35.839642",
            "level": "info",
            "message": "Frontend Docker ativo em http://localhost:13000",
            "url": "http://localhost:13000",
            "source": "docker_frontend"
        },
        {
            "timestamp": "2025-08-18T21:37:35.911587",
            "level": "info",
            "message": "Backend Docker saudável: ok",
            "url": "http://localhost:13001/health",
            "source": "docker_backend"
        }
    ],
    "dockerInfo": {
        "frontendPort": "13000",
        "backendPort": "13001",
        "postgresPort": "15432",
        "redisPort": "16379"
    },
    "status": "Logs Docker reais - 21:37:36 - Total: 15"
}
```

## 🎯 Logs Reais Capturados

### Containers Ativos:
```json
{
    "level": "info",
    "message": "Container aura-binance-frontend-dev - Status: Up",
    "url": "docker://e65021a49aa3",
    "source": "docker"
}
```

### Frontend Funcionando:
```json
{
    "level": "info",
    "message": "Frontend Docker ativo em http://localhost:13000",
    "url": "http://localhost:13000",
    "source": "docker_frontend"
}
```

### Backend Saudável:
```json
{
    "level": "info",
    "message": "Backend Docker saudável: ok",
    "url": "http://localhost:13001/health",
    "source": "docker_backend"
}
```

### Logs dos Containers:
```json
{
    "level": "info",
    "message": "Docker Log (aura-binance-frontend-dev): Network: http://172.25.0.5:3000/",
    "url": "docker://aura-binance-frontend-dev",
    "source": "docker_logs"
}
```

## 🔧 Configuração

### Pré-requisitos
```bash
# Python
pip install requests psutil

# Docker
docker --version
docker-compose --version
```

### Verificar Containers
```bash
# Listar containers
docker ps

# Verificar logs
docker logs aura-binance-frontend-dev
docker logs aura-binance-backend-dev
```

## 🚨 Troubleshooting

### Erro: "Docker não encontrado"
```bash
# Instalar Docker Desktop
# Verificar: docker --version
```

### Erro: "Containers não encontrados"
```bash
# Iniciar containers
docker-compose up -d

# Verificar status
docker ps | grep aura-binance
```

### Erro: "Porta não acessível"
```bash
# Verificar portas
netstat -ano | findstr :13000
netstat -ano | findstr :13001

# Reiniciar containers
docker-compose restart
```

## 🎉 Resultado

Agora o arquivo `LOGS-CONSOLE-FRONTEND.JSON` contém **logs reais do Docker**, mostrando:

- ✅ Status real dos containers Docker
- ✅ Logs autênticos dos serviços
- ✅ Conectividade real com as portas corretas
- ✅ Health checks dos endpoints
- ✅ Informações de rede dos containers
- ✅ Logs em tempo real dos processos

**O logger agora mostra o conteúdo real do console dentro das URLs Docker corretas!** 🐳🎯

## 📈 Comparação: Sistema Anterior vs Docker

| Aspecto | Sistema Anterior | Sistema Docker |
|---------|------------------|----------------|
| **Portas** | Fixas (3000, 3002) | Dinâmicas (13000, 13001) |
| **Fonte** | Sistema local | Containers Docker |
| **Logs** | Simulados | Reais dos containers |
| **Status** | Genérico | Status real dos containers |
| **URLs** | localhost:3000 | localhost:13000 (Docker) |
| **Health** | Não verificado | Health checks reais |

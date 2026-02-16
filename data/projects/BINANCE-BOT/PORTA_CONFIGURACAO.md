# 🔧 AURA Bot - Configuração de Portas Únicas

## ✅ Portas Configuradas (Sem Conflitos)

Seu projeto AURA Bot está configurado com **portas únicas** para evitar conflitos com outros containers:

### 🌐 Portas de Acesso

| Serviço | Porta Externa | Porta Interna | URL de Acesso |
|---------|---------------|---------------|---------------|
| **Frontend** | 13000 | 3000 | http://localhost:13000 |
| **Backend API** | 13001 | 3001 | http://localhost:13001 |
| **PostgreSQL** | 15432 | 5432 | localhost:15432 |
| **Redis** | 16379 | 6379 | localhost:16379 |
| **Nginx Proxy** | 18080 | 80 | http://localhost:18080 |
| **Prometheus** | 19090 | 9090 | http://localhost:19090 |
| **Grafana** | 13002 | 3000 | http://localhost:13002 |

### 🔍 Containers Existentes (Não Conflitam)

Seus containers atuais usam portas diferentes:
- **agente-cad-fastapi**: Porta 8000 ✅
- **mcp-bridge**: Portas 5000, 8080 ✅

## 🚀 Como Executar

### Opção 1: Script Automatizado (Recomendado)
```cmd
# Windows
scripts\dev-start.bat

# Linux/Mac
chmod +x scripts/dev-start.sh
./scripts/dev-start.sh
```

### Opção 2: Comando Manual
```cmd
# Desenvolvimento completo
docker-compose -f docker-compose.dev.yml up --build -d

# Ou versão simplificada
docker-compose up --build -d
```

### Opção 3: Serviços Individuais
```cmd
# Apenas banco e cache
docker-compose up postgres redis -d

# Apenas backend
docker-compose up backend -d

# Apenas frontend
docker-compose up frontend -d
```

## 🔧 Configurações Atualizadas

### Docker Compose
- ✅ `docker-compose.yml` - Portas únicas configuradas
- ✅ `docker-compose.dev.yml` - Ambiente completo para desenvolvimento
- ✅ `docker-compose.prod.yml` - Para produção

### Scripts
- ✅ `scripts/dev-start.bat` - Windows com portas corretas
- ✅ `scripts/dev-start.sh` - Linux/Mac com portas corretas

### Documentação
- ✅ `DEV_SETUP.md` - Guia completo atualizado
- ✅ `DOCKER_DEV_SUMMARY.md` - Resumo executivo

## 🎯 Próximos Passos

1. **Execute o script**: `scripts\dev-start.bat`
2. **Aguarde** os serviços iniciarem
3. **Acesse**: http://localhost:13000
4. **Desenvolva** com hot-reload ativo!

## 🔄 Hot-Reload Funcional

- **Backend**: Reinicializa automaticamente em mudanças
- **Frontend**: Atualização instantânea sem perder estado
- **Monitoramento**: Métricas em tempo real
- **Proxy**: Roteamento inteligente

## 🚨 Troubleshooting

### Se houver problemas de rede:
```cmd
# Reiniciar Docker Desktop
# Ou tentar sem proxy:
docker-compose up postgres redis -d
docker-compose up backend -d
docker-compose up frontend -d
```

### Verificar portas:
```cmd
# Verificar se as portas estão livres
netstat -an | findstr "13000"
netstat -an | findstr "13001"
netstat -an | findstr "15432"
```

**🎉 Seu ambiente está pronto com portas únicas e sem conflitos!**

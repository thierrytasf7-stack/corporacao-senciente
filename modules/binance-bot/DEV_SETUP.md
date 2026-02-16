# 🚀 AURA Bot - Ambiente de Desenvolvimento

## 📋 Visão Geral

Este documento descreve como configurar e executar o ambiente de desenvolvimento do AURA Bot com **hot-reload completo** para desenvolvimento dinâmico.

## 🎯 Características do Ambiente de Desenvolvimento

### ✅ Hot-Reload Completo
- **Backend**: Nodemon com TypeScript para reinicialização automática
- **Frontend**: Vite com HMR (Hot Module Replacement) para atualizações instantâneas
- **Monitoramento**: Prometheus + Grafana para métricas em tempo real
- **Proxy Reverso**: Nginx configurado para desenvolvimento

### 🔧 Serviços Incluídos
- **PostgreSQL 15**: Banco de dados principal
- **Redis 7**: Cache e message broker
- **Backend Node.js**: API REST + WebSocket
- **Frontend React**: Interface de usuário
- **Nginx**: Proxy reverso e load balancing
- **Prometheus**: Coleta de métricas
- **Grafana**: Visualização de dados

## 🚀 Início Rápido

### Pré-requisitos
- Docker Desktop instalado e rodando
- Docker Compose disponível
- Portas disponíveis: 3000, 3001, 5432, 6379, 80, 9090, 3002

### Iniciar Ambiente (Linux/Mac)
```bash
# Dar permissão de execução
chmod +x scripts/dev-start.sh

# Iniciar ambiente
./scripts/dev-start.sh

# Ou com limpeza completa
./scripts/dev-start.sh --clean
```

### Iniciar Ambiente (Windows)
```cmd
# Executar script
scripts\dev-start.bat

# Ou com limpeza completa
scripts\dev-start.bat --clean
```

### Iniciar Manualmente
```bash
# Construir e iniciar
docker-compose -f docker-compose.dev.yml up --build -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Parar serviços
docker-compose -f docker-compose.dev.yml down
```

## 🌐 URLs de Acesso

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:13000 | Interface principal |
| **Backend API** | http://localhost:13001 | API REST |
| **Nginx Proxy** | http://localhost:18080 | Proxy reverso |
| **Prometheus** | http://localhost:19090 | Métricas do sistema |
| **Grafana** | http://localhost:13002 | Dashboards (admin/admin) |
| **PostgreSQL** | localhost:15432 | Banco de dados |
| **Redis** | localhost:16379 | Cache |

## 🔄 Hot-Reload em Ação

### Backend (Node.js + TypeScript)
- **Arquivos monitorados**: `src/**/*.ts`, `src/**/*.js`, `src/**/*.json`
- **Ignorados**: Testes, node_modules, dist
- **Delay**: 1 segundo para evitar reinicializações excessivas
- **Comando**: `npm run dev` (nodemon)

### Frontend (React + Vite)
- **HMR**: Hot Module Replacement ativo
- **Arquivos monitorados**: Todos os arquivos do projeto
- **Atualização**: Instantânea sem perder estado
- **Comando**: `npm run dev` (vite)

## 📁 Estrutura de Arquivos

```
BINANCE-BOT/
├── docker-compose.dev.yml          # Compose para desenvolvimento
├── docker-compose.yml              # Compose padrão
├── docker-compose.prod.yml         # Compose para produção
├── backend/
│   ├── Dockerfile.dev              # Dockerfile para desenvolvimento
│   ├── nodemon.json                # Configuração do nodemon
│   └── src/                        # Código fonte
├── frontend/
│   ├── Dockerfile.dev              # Dockerfile para desenvolvimento
│   └── src/                        # Código fonte
├── nginx-dev.conf                  # Configuração do nginx
└── scripts/
    ├── dev-start.sh                # Script Linux/Mac
    └── dev-start.bat               # Script Windows
```

## ⚙️ Configurações de Desenvolvimento

### Variáveis de Ambiente (Backend)
```env
NODE_ENV=development
DATABASE_URL=postgresql://aura_user:aura_password@postgres:5432/aura_db_dev
REDIS_URL=redis://redis:6379
JWT_SECRET=dev-jwt-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-jwt-refresh-secret-key
ENCRYPTION_KEY=dev-encryption-key-32-chars-long
BINANCE_API_URL=https://api.binance.com
BINANCE_WS_URL=wss://stream.binance.com:9443
BINANCE_USE_TESTNET=true
LOG_LEVEL=debug
PORT=3001
```

### Variáveis de Ambiente (Frontend)
```env
VITE_API_URL=http://localhost:13001/api/v1
VITE_WS_URL=ws://localhost:13001
VITE_APP_ENV=development
```

## 🔧 Comandos Úteis

### Gerenciamento de Containers
```bash
# Ver status dos serviços
docker-compose -f docker-compose.dev.yml ps

# Ver logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs de um serviço específico
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend

# Reiniciar serviço
docker-compose -f docker-compose.dev.yml restart backend
docker-compose -f docker-compose.dev.yml restart frontend

# Parar todos os serviços
docker-compose -f docker-compose.dev.yml down

# Parar e remover volumes
docker-compose -f docker-compose.dev.yml down -v
```

### Desenvolvimento
```bash
# Acessar container do backend
docker exec -it aura-backend-dev sh

# Acessar container do frontend
docker exec -it aura-frontend-dev sh

# Executar testes no backend
docker exec -it aura-backend-dev npm test

# Executar testes no frontend
docker exec -it aura-frontend-dev npm test

# Instalar nova dependência no backend
docker exec -it aura-backend-dev npm install <package>

# Instalar nova dependência no frontend
docker exec -it aura-frontend-dev npm install <package>
```

### Banco de Dados
```bash
# Acessar PostgreSQL
docker exec -it aura-postgres-dev psql -U aura_user -d aura_db_dev

# Executar migrações
docker exec -it aura-backend-dev npm run migrate

# Fazer backup do banco
docker exec aura-postgres-dev pg_dump -U aura_user aura_db_dev > backup.sql
```

## 🐛 Debugging

### Logs Detalhados
```bash
# Logs do backend com debug
docker-compose -f docker-compose.dev.yml logs -f backend | grep -i error

# Logs do frontend
docker-compose -f docker-compose.dev.yml logs -f frontend

# Logs do nginx
docker-compose -f docker-compose.dev.yml logs -f nginx-dev
```

### Health Checks
```bash
# Verificar saúde do backend
curl http://localhost:3001/api/v1/health

# Verificar saúde do frontend
curl http://localhost:3000

# Verificar PostgreSQL
docker exec aura-postgres-dev pg_isready -U aura_user -d aura_db_dev

# Verificar Redis
docker exec aura-redis-dev redis-cli ping
```

## 📊 Monitoramento

### Prometheus
- **URL**: http://localhost:9090
- **Métricas coletadas**: CPU, memória, requisições, latência
- **Retenção**: 24 horas (desenvolvimento)

### Grafana
- **URL**: http://localhost:3002
- **Login**: admin/admin
- **Dashboards**: Pré-configurados para monitoramento

## 🔒 Segurança em Desenvolvimento

### Configurações de Segurança
- **Rate Limiting**: Configurado no nginx
- **CORS**: Habilitado para desenvolvimento
- **Headers de Segurança**: Configurados no nginx
- **Testnet**: Binance testnet habilitado por padrão

### Chaves e Segredos
- **JWT**: Chaves de desenvolvimento (NÃO usar em produção)
- **Banco**: Credenciais de desenvolvimento
- **Redis**: Sem senha em desenvolvimento

## 🚨 Troubleshooting

### Problemas Comuns

#### Porta já em uso
```bash
# Verificar portas em uso
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Parar processo que está usando a porta
kill -9 <PID>
```

#### Container não inicia
```bash
# Ver logs detalhados
docker-compose -f docker-compose.dev.yml logs <service>

# Reconstruir imagem
docker-compose -f docker-compose.dev.yml build --no-cache <service>

# Limpar volumes
docker-compose -f docker-compose.dev.yml down -v
```

#### Hot-reload não funciona
```bash
# Verificar se nodemon está rodando
docker exec -it aura-backend-dev ps aux | grep nodemon

# Verificar logs do nodemon
docker-compose -f docker-compose.dev.yml logs -f backend | grep nodemon

# Reiniciar serviço
docker-compose -f docker-compose.dev.yml restart backend
```

#### Problemas de rede
```bash
# Verificar redes Docker
docker network ls

# Verificar conectividade entre containers
docker exec -it aura-backend-dev ping postgres
docker exec -it aura-backend-dev ping redis
```

## 📝 Próximos Passos

1. **Configurar IDE**: Recomendamos VS Code com extensões para TypeScript e React
2. **Configurar Git Hooks**: Para linting e testes automáticos
3. **Configurar CI/CD**: Para integração contínua
4. **Configurar Produção**: Usar `docker-compose.prod.yml`

## 🤝 Contribuição

Para contribuir com o desenvolvimento:

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Configure o ambiente de desenvolvimento
4. Desenvolva e teste suas mudanças
5. Envie um pull request

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique os logs dos containers
- Consulte a documentação do projeto
- Abra uma issue no repositório

---

**🎉 Agora você tem um ambiente de desenvolvimento completo com hot-reload ativo!**

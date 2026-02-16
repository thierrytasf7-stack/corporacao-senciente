# 🧬 Arquitetura Areté - Corporação Senciente

**Estado**: Industry 7.0 • Areté (Excelência Suprema)

## 📐 Visão Geral

Arquitetura híbrida de controle remoto para operação 24/7 da Corporação Senciente.

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE VISUALIZAÇÃO                    │
│                  Vercel (Mission Control)                    │
│              Next.js 14 + Tailwind + Socket.IO               │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  CAMADA DE ORQUESTRAÇÃO                      │
│              Oracle VPS (Cérebro Central)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Traefik  │  │ Maestro  │  │ Infisical│  │ Netdata  │   │
│  │ (SSL)    │  │(WebSocket)│ │(Secrets) │  │(Metrics) │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │ WebSocket (Tailscale VPN)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  CAMADA DE EXECUÇÃO                         │
│              PCs Locais (Agentes)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PC Principal │  │ PC Trading   │  │ PC GPU       │     │
│  │ Listener     │  │ Listener     │  │ Listener     │     │
│  │ + Netdata    │  │ + Netdata    │  │ + Netdata    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Componentes

### 1. Mission Control (Vercel)

**Função**: Dashboard de controle remoto

**Stack**:
- Next.js 14 (App Router)
- Tailwind CSS
- Socket.IO Client
- Radix UI

**Funcionalidades**:
- Visualização de agentes em tempo real
- Métricas de CPU/RAM/Disco
- Comandos remotos (restart, stop, screenshot)
- Terminal remoto
- Alertas de status crítico

**Deploy**: Vercel (automático via GitHub)

### 2. Maestro (Oracle VPS)

**Função**: Hub WebSocket para comunicação com agentes

**Stack**:
- FastAPI
- Socket.IO
- Redis (Pub/Sub)
- Python 3.12

**Funcionalidades**:
- Registro de agentes
- Sistema de heartbeat (10s)
- Comandos remotos
- Notificações (Telegram/Discord)
- Health monitoring

**Endpoints**:
- `GET /agents` - Lista agentes
- `GET /agents/{id}` - Info de agente
- `POST /agents/{id}/command` - Enviar comando
- `POST /agents/{id}/restart` - Reiniciar agente
- `POST /agents/{id}/stop` - Parar agente
- `POST /agents/{id}/screenshot` - Screenshot

### 3. Agent Listener (PCs Locais)

**Função**: Cliente que conecta PCs ao Maestro

**Stack**:
- Python 3.12
- Socket.IO Client
- psutil (métricas)

**Funcionalidades**:
- Conexão WebSocket com Maestro
- Heartbeat automático
- Execução de comandos locais
- Coleta de métricas
- Screenshot (opcional)

**Comandos Suportados**:
- `restart` - Reinicia o listener
- `stop` - Para o listener
- `screenshot` - Captura tela
- `shell` - Executa comando shell
- `docker_ps` - Lista containers
- `docker_restart` - Reinicia container
- `metrics` - Retorna métricas

### 4. Infisical (Oracle VPS)

**Função**: Gerenciamento de segredos self-hosted

**Stack**:
- Infisical (Docker)
- MongoDB

**Funcionalidades**:
- Armazenamento criptografado de secrets
- Rotação automática de chaves
- Integração com agentes
- UI web para gerenciamento

**Uso**:
```python
from infisical import InfisicalClient

client = InfisicalClient(token=os.environ["INFISICAL_TOKEN"])
secrets = client.get_all_secrets(environment="production")
```

### 5. Netdata (Todos os Nodes)

**Função**: Observabilidade em tempo real (1 segundo)

**Stack**:
- Netdata (Docker ou nativo)

**Funcionalidades**:
- Métricas de sistema (CPU, RAM, Disco, Rede)
- Métricas de aplicação
- Alertas configuráveis
- Dashboard web
- Integração com Netdata Cloud

**Granularidade**: 1 segundo (vs 15-60s do Prometheus)

### 6. Traefik (Oracle VPS)

**Função**: Reverse proxy com SSL automático

**Stack**:
- Traefik v3.0
- Let's Encrypt

**Funcionalidades**:
- SSL automático (Let's Encrypt)
- Load balancing
- Health checks
- Rate limiting

### 7. Watchtower (PCs Locais)

**Função**: Auto-deploy de containers

**Stack**:
- Watchtower (Docker)

**Funcionalidades**:
- Monitora GitHub Container Registry
- Atualiza containers automaticamente
- Rolling restart
- Cleanup de imagens antigas

**Intervalo**: 5 minutos

## 🔄 Fluxo de Dados

### Heartbeat

```
Agent → WebSocket → Maestro → Redis → Mission Control
  ↑                                              ↓
  └─────────────────── Status Update ───────────┘
```

### Comando Remoto

```
Mission Control → HTTPS → Maestro → WebSocket → Agent
                                                      ↓
                                              Execução Local
                                                      ↓
Agent → WebSocket → Maestro → Redis → Mission Control
  ↑                                              ↓
  └─────────────── Response ─────────────────────┘
```

## 🔐 Segurança

### Camadas

1. **HTTPS/TLS**: Todas as comunicações criptografadas
2. **Tailscale VPN**: Rede privada para agentes
3. **Infisical**: Secrets nunca tocam o disco
4. **Autenticação**: Tokens JWT para agentes
5. **Rate Limiting**: Proteção contra DDoS

### Secrets Management

- **Antes**: `.env` files nos PCs (vulnerável)
- **Depois**: Infisical self-hosted (secrets em RAM)

## 📊 Métricas e Observabilidade

### Netdata

- **Latência**: < 1 segundo
- **Granularidade**: 1 segundo
- **Métricas**: CPU, RAM, Disco, Rede, GPU, Containers

### Maestro

- **Heartbeat Interval**: 10 segundos
- **Critical Threshold**: 3 misses (30s)
- **Alert Channels**: Telegram, Discord

## 🚀 Deploy

### Ordem Recomendada

1. **Oracle VPS**: Deploy do stack completo
2. **Mission Control**: Deploy na Vercel
3. **Agent Listeners**: Instalar em cada PC
4. **Netdata**: Instalar em todos os nodes
5. **Watchtower**: Configurar nos PCs locais

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para detalhes.

## 🎯 KPIs do Areté

| Métrica | Alvo | Ferramenta |
|---------|------|------------|
| Latência de métricas | < 1s | Netdata |
| Tempo de deploy | < 5min | Watchtower |
| Segredos em disco | 0 | Infisical |
| Código com lint errors | 0 | Ruff |
| Heartbeat miss rate | < 0.1% | Maestro |
| Uptime Control Plane | 99.9% | Oracle VPS |

## 📚 Documentação

- [DEPLOYMENT.md](DEPLOYMENT.md) - Guia de deploy
- [oracle-vps/README.md](oracle-vps/README.md) - Oracle VPS
- [mission-control/README.md](mission-control/README.md) - Mission Control
- [agent-listener/](agent-listener/) - Agent Listener

## 🔮 Próximos Passos

- [ ] Integrar Clerk para autenticação
- [ ] Terminal remoto via xterm.js
- [ ] Gráficos de histórico de métricas
- [ ] Notificações push via Web Push API
- [ ] Backup automático de configurações
- [ ] Multi-region deployment

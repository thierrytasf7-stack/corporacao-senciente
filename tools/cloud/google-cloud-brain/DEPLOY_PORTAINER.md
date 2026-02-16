# 🚀 Deploy no Portainer - Guia Completo

## ✅ Pré-requisitos Verificados

- ✅ Imagem Maestro está **PÚBLICA** no GitHub Container Registry
- ✅ Portainer rodando no Google Cloud VM
- ✅ Tailscale configurado e funcionando

## 📋 Passo a Passo do Deploy

### 1. Obter IP do Tailscale do Google Cloud

No servidor Google Cloud, execute:
```bash
tailscale ip -4
```

Anote o IP (formato: `100.x.x.x`)

### 2. Acessar Portainer

1. Acesse Portainer via Tailscale IP: `https://100.x.x.x:9443`
2. Faça login

### 3. Criar Nova Stack

1. No menu lateral: **Stacks**
2. Clique em **Add Stack**
3. **Name**: `senciente-maestro-stack`
4. **Build method**: Selecione **Web editor**

### 4. Colar Docker Compose

Cole o conteúdo completo do arquivo `docker-compose.production.yml`:

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: senciente-redis
    restart: unless-stopped
    command: >
      redis-server
      --maxmemory 128mb
      --maxmemory-policy allkeys-lru
      --save ""
      --appendonly no
      --tcp-backlog 511
      --timeout 0
      --tcp-keepalive 300
    networks:
      - senciente-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    deploy:
      resources:
        limits:
          memory: 150M
        reservations:
          memory: 100M
    volumes:
      - redis_data:/data

  maestro:
    image: ghcr.io/thierrytasf7-stack/diana-corporacao-senciente-maestro:latest
    container_name: senciente-maestro
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - REDIS_URL=redis://redis:6379
      - HEARTBEAT_INTERVAL=30
      - HEARTBEAT_MISS_THRESHOLD=3
      - TELEGRAM_BOT_TOKEN=
      - DISCORD_WEBHOOK_URL=
      - TAILSCALE_IP=100.x.x.x
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - senciente-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

volumes:
  redis_data:
    driver: local

networks:
  senciente-network:
    driver: bridge
```

### 5. Configurar Variáveis de Ambiente

**IMPORTANTE**: Substitua `TAILSCALE_IP=100.x.x.x` pelo IP real do seu servidor Google Cloud no Tailscale.

**Opcional**: Se tiver Telegram ou Discord configurados, adicione os tokens:
- `TELEGRAM_BOT_TOKEN=seu_token_aqui`
- `DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...`

### 6. Deploy

1. Role até o final da página
2. Clique em **Deploy the stack**
3. Aguarde o deploy (1-2 minutos)

### 7. Verificar Deploy

1. Volte para **Stacks**
2. Clique em `senciente-maestro-stack`
3. Verifique os containers:
   - ✅ `senciente-redis` - Status: Running
   - ✅ `senciente-maestro` - Status: Running

### 8. Verificar Logs

1. Clique em `senciente-maestro`
2. Aba **Logs**
3. Procure por:
   - `Uvicorn running on http://0.0.0.0:8080`
   - `Socket.IO server started`
   - Sem erros de conexão

### 9. Testar Conexão

No seu PC local, teste a conexão:

```bash
# Via Tailscale IP
curl http://100.x.x.x:8080/health
```

Resposta esperada: `{"status":"ok"}`

## 🔍 Troubleshooting

### Erro: "denied denied"
- ✅ **Resolvido**: Imagem já está pública

### Erro: "port already in use"
- Verifique se há outro container usando a porta 8080
- Pare o container conflitante ou mude a porta no docker-compose

### Container não inicia
- Verifique os logs: **Containers** → `senciente-maestro` → **Logs**
- Verifique recursos: VM tem pelo menos 1GB RAM?

### Redis não conecta
- Verifique se `REDIS_URL=redis://redis:6379` está correto
- Verifique se ambos containers estão na mesma rede

## ✅ Checklist Final

- [ ] Stack criada e deployada
- [ ] Redis rodando
- [ ] Maestro rodando
- [ ] Logs sem erros
- [ ] Health check respondendo: `/health`
- [ ] Acessível via Tailscale IP:8080

## 🎯 Próximos Passos

Após deploy bem-sucedido:

1. **Configurar Agent Listener** nos PCs locais
2. **Conectar Mission Control Center** (frontend)
3. **Testar comunicação** entre componentes

---

**Tempo estimado**: 5 minutos
**Dificuldade**: Fácil

# 🚀 Guia de Deploy - Google Cloud Brain via Portainer

Deploy do stack Maestro + Redis no Google Cloud e2-micro usando Portainer.

**⚠️ IMPORTANTE**: Se você receber erro de build, veja [PORTAINER_DEPLOY_FIX.md](PORTAINER_DEPLOY_FIX.md) para soluções.

## 📋 Pré-requisitos

- Google Cloud VM rodando (e2-micro)
- Docker instalado
- Portainer acessível (porta 9443)
- Tailscale instalado e configurado
- IP Tailscale do servidor conhecido

## 🔍 Passo 1: Obter IP Tailscale

No servidor Google Cloud, execute:

```bash
tailscale ip -4
```

Anote o IP (ex: `100.78.145.65`). Este será usado para conectar os agentes.

## 📦 Passo 2: Preparar Arquivos

### Opção A: Via Git (Recomendado)

```bash
# No servidor Google Cloud
cd ~
git clone https://github.com/senciente/diana-corporacao-senciente.git
cd diana-corporacao-senciente/google-cloud-brain
```

### Opção B: Upload Manual

1. Acesse Portainer via `https://100.78.145.65:9443`
2. Vá em **Stacks** > **Add Stack**
3. Use o editor web para colar o conteúdo de `docker-compose.yml`

## 🎯 Passo 3: Criar Stack no Portainer

### 3.1 Acessar Portainer

1. Abra o navegador
2. Acesse: `https://<IP_TAILSCALE>:9443`
3. Faça login no Portainer

### 3.2 Criar Nova Stack

1. No menu lateral, clique em **Stacks**
2. Clique em **Add Stack**
3. Preencha:
   - **Name**: `senciente-brain`
   - **Build method**: `Web editor`
   - **Environment variables**: (veja abaixo)

### 3.3 Colar docker-compose.yml

Copie o conteúdo de `docker-compose.yml` e cole no editor web.

### 3.4 Configurar Variáveis de Ambiente

Na seção **Environment variables**, adicione:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `TAILSCALE_IP` | `100.78.145.65` | IP Tailscale do servidor (obtido no Passo 1) |
| `TELEGRAM_BOT_TOKEN` | (opcional) | Token do bot Telegram para alertas |
| `DISCORD_WEBHOOK_URL` | (opcional) | Webhook do Discord para alertas |

### 3.5 Deploy

1. Clique em **Deploy the stack**
2. Aguarde o build e start dos containers
3. Verifique os logs em **Containers** > `senciente-maestro` > **Logs**

## ✅ Passo 4: Validar Deploy

### 4.1 Verificar Containers

No Portainer, vá em **Containers** e verifique:

- ✅ `senciente-redis` - Status: Running
- ✅ `senciente-maestro` - Status: Running

### 4.2 Testar Health Check

No terminal do servidor ou via Portainer **Exec Console**:

```bash
curl http://localhost:8080/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "agents_connected": 0,
  "tailscale_ip": "100.78.145.65",
  "timestamp": "2026-01-22T..."
}
```

### 4.3 Testar via Tailscale

De qualquer PC conectado ao Tailscale:

```bash
curl http://100.78.145.65:8080/health
```

## 🔧 Passo 5: Configurar Agent Listeners

Nos PCs locais, configure o `agent-listener`:

1. Edite o arquivo `.env`:
```env
MAESTRO_URL=http://100.78.145.65:8080
AGENT_ID=pc-principal
AGENT_NAME=PC Principal
```

2. Execute o listener:
```bash
python listener.py
```

3. Verifique no Portainer (logs do `senciente-maestro`) se o agente se conectou.

## 📊 Passo 6: Monitorar

### Logs no Portainer

1. Vá em **Containers** > `senciente-maestro`
2. Clique em **Logs**
3. Você verá:
   - Conexões de agentes
   - Heartbeats recebidos
   - Comandos executados

### Métricas de Recursos

No Portainer, vá em **Containers** e verifique o uso de recursos:

- **Redis**: Deve usar ~100-150MB RAM
- **Maestro**: Deve usar ~128-256MB RAM
- **Total**: ~300-400MB (dentro do limite de 1GB)

## 🐛 Troubleshooting

### Container não inicia

1. Verifique logs: **Containers** > `senciente-maestro` > **Logs**
2. Verifique se Redis está rodando: `docker ps | grep redis`
3. Verifique variáveis de ambiente no Portainer

### Redis usando muita memória

1. Acesse o container Redis: **Containers** > `senciente-redis` > **Exec Console**
2. Execute: `redis-cli INFO memory`
3. Verifique `used_memory_human` (deve ser < 150MB)

### Agentes não conectam

1. Verifique se o IP Tailscale está correto no `.env` do listener
2. Teste conectividade: `ping 100.78.145.65` (do PC local)
3. Verifique firewall do Google Cloud (porta 8080 deve estar aberta internamente)

### Maestro não responde

1. Verifique logs: **Containers** > `senciente-maestro` > **Logs`
2. Verifique se a porta 8080 está exposta: `docker ps | grep maestro`
3. Teste localmente: `curl http://localhost:8080/health`

## 🔄 Atualizar Stack

Para atualizar o stack:

1. No Portainer, vá em **Stacks** > `senciente-brain`
2. Clique em **Editor**
3. Modifique o `docker-compose.yml`
4. Clique em **Update the stack**

## 📝 Notas Importantes

- **Memória**: O stack foi otimizado para usar < 500MB RAM total
- **Rede**: Tudo funciona via Tailscale (sem portas públicas)
- **Segurança**: Apenas IPs Tailscale podem acessar o Maestro
- **Backup**: Redis não persiste dados (volátil). Para persistência, modifique o docker-compose.yml

## 🎯 Próximos Passos

1. Configurar Agent Listeners nos PCs locais
2. Conectar Mission Control (Vercel) ao Maestro via Tailscale
3. Configurar Netdata para monitoramento
4. Configurar alertas (Telegram/Discord)

---

**Última atualização**: 22/01/2026

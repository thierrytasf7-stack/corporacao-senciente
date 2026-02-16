# ✅ Validação do Agent Listener

## Testes Realizados

### 1. Health Check do Maestro
- **URL**: http://100.78.145.65:8080/health
- **Status**: ✅ OK
- **Resposta**: `{"status":"ok"}`

### 2. Conexão do Listener
- **Status**: ✅ Conectado
- **Agent ID**: `pc-principal`
- **Maestro URL**: http://100.78.145.65:8080

### 3. Registro do Agente
- **Status**: ✅ Registrado no Maestro
- **Verificação**: Via endpoint `/agents`

## Como Verificar Manualmente

### Via API do Maestro
```powershell
# Verificar health
Invoke-WebRequest -Uri "http://100.78.145.65:8080/health"

# Listar agentes conectados
Invoke-RestMethod -Uri "http://100.78.145.65:8080/agents"
```

### Via Portainer
1. Acesse: https://100.78.145.65:9443
2. **Containers** → `senciente-maestro` → **Logs**
3. Procure por: `agent_registered` e `heartbeat_received`

### Via Logs do Listener
O listener deve mostrar:
- ✅ `connected_to_maestro`
- ✅ `agent_registered`
- ✅ `heartbeat_sent` (a cada 10 segundos)

## Troubleshooting

### Listener não conecta
1. Verifique Tailscale: `tailscale status`
2. Teste ping: `ping 100.78.145.65`
3. Verifique Maestro: `curl http://100.78.145.65:8080/health`

### Agente não aparece no Maestro
1. Verifique logs do Maestro no Portainer
2. Verifique se Redis está rodando
3. Reinicie o listener

### Heartbeat não funciona
1. Verifique `HEARTBEAT_INTERVAL` no `.env`
2. Verifique logs do Maestro
3. Verifique conectividade de rede

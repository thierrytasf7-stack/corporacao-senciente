# 🔧 Solução Completa - CORS e Mixed Content

**Status:** Problemas identificados e soluções documentadas

## 🚨 Problemas Identificados

### 1. CORS Não Aplicado
- ✅ Código CORS adicionado no `main.py`
- ❌ Maestro não foi reiniciado → CORS não está ativo
- **Sintoma:** `Access-Control-Allow-Origin header is missing`

### 2. Mixed Content (HTTPS → HTTP)
- Mission Control está em HTTPS (Vercel)
- Maestro está em HTTP (IP Tailscale)
- Navegadores bloqueiam HTTPS → HTTP
- **Sintoma:** `Mixed Content: The page was loaded over HTTPS, but attempted to connect to insecure WebSocket`

### 3. Agente CRITICAL
- Agente está em status CRITICAL
- Comandos retornam 503 (Servidor não disponível)
- **Solução:** Reiniciar Agent Listener

## ✅ Soluções Aplicadas

### 1. CORS no Código ✅
```python
# google-cloud-brain/maestro/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Fallback HTTP Melhorado ✅
- Endpoints diretos para restart/stop/screenshot
- Melhor tratamento de erros
- Verificação de conexão HTTP

## 🎯 Ações Necessárias

### PASSO 1: Reiniciar Maestro (Aplicar CORS)

**Opção A: Via Portainer (Recomendado)**
1. Acesse Portainer no Google Cloud
2. Vá em: Containers → `senciente-maestro`
3. Clique em: **Restart**
4. Aguarde 30 segundos

**Opção B: Via SSH**
```bash
ssh usuario@google-cloud-ip
docker restart senciente-maestro
```

**Opção C: Via Docker Compose**
```bash
cd google-cloud-brain
docker-compose restart maestro
```

### PASSO 2: Resolver Mixed Content

**Solução Recomendada: Cloudflare Tunnel**

```bash
# No servidor Google Cloud
# 1. Instalar cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# 2. Criar tunnel
cloudflared tunnel --url http://localhost:8080

# 3. Copiar a URL HTTPS gerada (ex: https://xxxxx.trycloudflare.com)
# 4. Atualizar NEXT_PUBLIC_MAESTRO_URL no Vercel com essa URL
```

**Alternativa: ngrok**
```bash
ngrok http 8080
# Copiar URL HTTPS gerada
```

**Alternativa: Tailscale Funnel**
```bash
tailscale funnel 8080
# Copiar URL HTTPS gerada
```

### PASSO 3: Atualizar Variável de Ambiente

Após obter URL HTTPS do proxy:

```bash
# Via Dashboard Vercel
# Settings > Environment Variables > NEXT_PUBLIC_MAESTRO_URL
# Atualizar para: https://xxxxx.trycloudflare.com (ou URL do proxy)

# Ou via CLI
cd mission-control
npx vercel env rm NEXT_PUBLIC_MAESTRO_URL production
echo "https://xxxxx.trycloudflare.com" | npx vercel env add NEXT_PUBLIC_MAESTRO_URL production
```

### PASSO 4: Novo Deploy

```bash
cd mission-control
npx vercel --prod
```

### PASSO 5: Reiniciar Agent Listener (Se CRITICAL)

```powershell
cd agent-listener
.\INICIAR.ps1
```

## 📊 Status Atual

- ✅ CORS código adicionado
- ⚠️ Maestro precisa reiniciar (aplicar CORS)
- ⚠️ Mixed Content precisa proxy HTTPS
- ⚠️ Agente CRITICAL (reiniciar listener)

## 🚀 Ordem de Execução

1. **Reiniciar Maestro** → Aplica CORS
2. **Configurar Cloudflare Tunnel** → Resolve Mixed Content
3. **Atualizar variável Vercel** → Usa URL HTTPS
4. **Novo deploy** → Aplica mudanças
5. **Reiniciar Agent Listener** → Agente volta ONLINE
6. **Testar** → Tudo deve funcionar!

---

**Após seguir esses passos, a conexão deve funcionar completamente!** 🚀

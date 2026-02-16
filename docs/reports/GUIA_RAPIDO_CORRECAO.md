# 🚀 Guia Rápido - Corrigir Conexão Mission Control

**Problemas:** CORS não aplicado + Mixed Content (HTTPS → HTTP)

## ⚡ Solução Rápida (5 minutos)

### PASSO 1: Reiniciar Maestro (Aplicar CORS)

**Via Portainer:**
1. Acesse Portainer no Google Cloud
2. Containers → `senciente-maestro` → **Restart**
3. Aguarde 30 segundos

**Via SSH:**
```bash
ssh usuario@google-cloud-ip
docker restart senciente-maestro
```

### PASSO 2: Configurar Cloudflare Tunnel (Resolver Mixed Content)

**No servidor Google Cloud:**
```bash
# Instalar
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Iniciar tunnel
cloudflared tunnel --url http://localhost:8080

# Copiar a URL HTTPS gerada (ex: https://xxxxx.trycloudflare.com)
```

### PASSO 3: Atualizar Vercel

**Via Dashboard:**
1. https://vercel.com/dashboard
2. Settings → Environment Variables
3. Editar `NEXT_PUBLIC_MAESTRO_URL`
4. Valor: `https://xxxxx.trycloudflare.com` (URL do tunnel)
5. Salvar

### PASSO 4: Novo Deploy

```powershell
cd mission-control
npx vercel --prod
```

### PASSO 5: Reiniciar Agent Listener (Se CRITICAL)

```powershell
cd agent-listener
.\INICIAR.ps1
```

## ✅ Após Isso

1. Recarregue Mission Control (Ctrl+F5)
2. Deve mostrar "Maestro Online"
3. Botões devem funcionar!

---

**Tempo total: ~5 minutos** 🚀

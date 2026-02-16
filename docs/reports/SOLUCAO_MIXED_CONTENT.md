# 🔧 Solução para Mixed Content (HTTPS → HTTP)

**Problema:** Mission Control (HTTPS) não pode acessar Maestro (HTTP) devido a Mixed Content Policy.

## 🚨 Problema Identificado

Os erros mostram:
- **Mixed Content:** HTTPS (Vercel) tentando acessar HTTP (Maestro) - **BLOQUEADO**
- **CORS:** Headers não estão sendo retornados (Maestro precisa reiniciar)

## ✅ Soluções

### Solução 1: Proxy Público (RECOMENDADO)

Criar um proxy que expõe o Maestro via HTTPS:

#### Opção A: Cloudflare Tunnel (Gratuito)

```bash
# No servidor Google Cloud
# 1. Instalar cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# 2. Criar tunnel
cloudflared tunnel --url http://localhost:8080
# Isso cria uma URL pública HTTPS que redireciona para o Maestro
```

#### Opção B: ngrok (Gratuito com limitações)

```bash
# No servidor Google Cloud
ngrok http 8080
# Retorna uma URL pública HTTPS
```

#### Opção C: Tailscale Funnel (Experimental, Gratuito)

```bash
# No servidor Google Cloud
tailscale funnel 8080
# Cria URL pública HTTPS via Tailscale
```

### Solução 2: HTTPS no Maestro (Mais Complexo)

Configurar SSL/TLS no Maestro usando:
- Let's Encrypt
- Traefik como reverse proxy
- Nginx com SSL

### Solução 3: Usar HTTP no Mission Control (Temporário)

**NÃO RECOMENDADO** - Mas funciona para testes:
- Deploy Mission Control em HTTP (não HTTPS)
- Ou usar domínio custom sem SSL

## 🎯 Ação Imediata

**PASSO 1: Reiniciar Maestro para aplicar CORS**
```bash
# Via Portainer ou SSH
docker restart senciente-maestro
```

**PASSO 2: Configurar Proxy Público**

Recomendo **Cloudflare Tunnel** (mais simples):

```bash
# No Google Cloud
cloudflared tunnel --url http://localhost:8080
# Copie a URL HTTPS gerada
# Atualize NEXT_PUBLIC_MAESTRO_URL no Vercel com essa URL
```

## 📝 Próximos Passos

1. ✅ Reiniciar Maestro (aplicar CORS)
2. ✅ Configurar Cloudflare Tunnel
3. ✅ Atualizar variável de ambiente no Vercel
4. ✅ Fazer novo deploy
5. ✅ Testar conexão

---

**Após configurar proxy HTTPS, o Mixed Content será resolvido!** 🚀

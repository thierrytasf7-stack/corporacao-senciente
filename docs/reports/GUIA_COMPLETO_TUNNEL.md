# 🚀 Guia Completo - Configurar Cloudflare Tunnel

**Objetivo:** Resolver Mixed Content (HTTPS → HTTP) e permitir conexão do Mission Control ao Maestro.

## 📋 Pré-requisitos

- ✅ Maestro rodando no Google Cloud
- ✅ CORS configurado no código (já feito)
- ✅ Maestro reiniciado (você já fez isso!)
- ✅ Acesso SSH ao servidor Google Cloud

## 🎯 Passo a Passo Completo

### PASSO 1: Conectar ao Google Cloud

```bash
ssh usuario@google-cloud-ip
```

### PASSO 2: Executar Script de Configuração

```bash
cd google-cloud-brain
sudo bash CONFIGURAR_CLOUDFLARE_TUNNEL.sh
```

O script irá:
1. ✅ Instalar cloudflared (se necessário)
2. ✅ Criar serviço systemd
3. ✅ Iniciar tunnel automaticamente
4. ✅ Mostrar URL HTTPS gerada

**IMPORTANTE:** Copie a URL gerada (ex: `https://xxxxx.trycloudflare.com`)

### PASSO 3: Validar Tunnel (Opcional)

No servidor Google Cloud:
```bash
sudo bash VALIDAR_TUNNEL.sh
```

Ou localmente (Windows):
```powershell
.\TESTAR_TUNNEL_LOCAL.ps1
# Cole a URL quando solicitado
```

### PASSO 4: Atualizar Vercel

**Opção A: Script Automatizado (Recomendado)**
```powershell
.\ATUALIZAR_VERCEL_COM_TUNNEL.ps1
# Cole a URL do tunnel quando solicitado
```

**Opção B: Manual**
1. Acesse: https://vercel.com/dashboard
2. Settings → Environment Variables
3. Editar `NEXT_PUBLIC_MAESTRO_URL`
4. Valor: URL do tunnel (HTTPS)
5. Salvar

### PASSO 5: Novo Deploy

```powershell
cd mission-control
npx vercel --prod
```

### PASSO 6: Testar

1. Aguarde 1-2 minutos
2. Acesse Mission Control
3. Recarregue (Ctrl+F5)
4. Deve mostrar "Maestro Online"
5. Botões devem funcionar!

## 🔧 Gerenciamento do Tunnel

### Ver Status
```bash
sudo systemctl status cloudflared-tunnel.service
```

### Ver Logs
```bash
sudo journalctl -u cloudflared-tunnel.service -f
```

### Reiniciar Tunnel
```bash
sudo systemctl restart cloudflared-tunnel.service
```

### Parar Tunnel
```bash
sudo systemctl stop cloudflared-tunnel.service
```

### Desabilitar Auto-start
```bash
sudo systemctl disable cloudflared-tunnel.service
```

## ⚠️ Notas Importantes

1. **URL Temporária:** URLs do Cloudflare Tunnel mudam a cada reinício (modo quick tunnel)
   - Para URL permanente, configure tunnel nomeado (mais complexo)

2. **Reinício do Servidor:** O serviço systemd mantém o tunnel rodando automaticamente

3. **Firewall:** Não precisa abrir portas, o tunnel funciona via Cloudflare

4. **Segurança:** O tunnel é público, mas o Maestro ainda está protegido por Tailscale

## 🐛 Troubleshooting

### Tunnel não inicia
```bash
# Ver logs detalhados
sudo journalctl -u cloudflared-tunnel.service -n 50

# Verificar se cloudflared está instalado
which cloudflared
cloudflared --version
```

### URL não aparece
```bash
# Ver logs em tempo real
sudo journalctl -u cloudflared-tunnel.service -f
# Procure por: "https://xxxxx.trycloudflare.com"
```

### Health check falha
```bash
# Verificar se Maestro está rodando
docker ps | grep maestro

# Testar Maestro localmente
curl http://localhost:8080/health
```

### CORS ainda não funciona
```bash
# Reiniciar Maestro novamente
docker restart senciente-maestro

# Aguardar 30 segundos e testar
curl -I http://localhost:8080/health
# Deve mostrar: Access-Control-Allow-Origin: *
```

## ✅ Checklist Final

- [ ] Tunnel configurado e rodando
- [ ] URL HTTPS obtida
- [ ] Variável Vercel atualizada
- [ ] Novo deploy realizado
- [ ] Mission Control mostra "Maestro Online"
- [ ] Botões funcionando

---

**Após completar todos os passos, a conexão deve estar 100% funcional!** 🚀

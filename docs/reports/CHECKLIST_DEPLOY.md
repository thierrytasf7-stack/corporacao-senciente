# ✅ Checklist de Deploy - Corporação Senciente

Use este checklist para garantir que todos os componentes estão configurados corretamente.

## 🖥️ Oracle VPS (Quando disponível)

- [ ] VPS provisionada (Oracle Cloud Always Free)
- [ ] Docker instalado
- [ ] Docker Compose instalado
- [ ] Domínio configurado (A record)
- [ ] Arquivo `.env` criado e preenchido
- [ ] `traefik/acme.json` criado (chmod 600)
- [ ] `docker compose up -d` executado
- [ ] Traefik acessível em `https://api.{DOMAIN}`
- [ ] Maestro respondendo em `/health`
- [ ] Infisical acessível em `https://secrets.{DOMAIN}`
- [ ] Netdata acessível em `https://metrics.{DOMAIN}`

## 🌐 Mission Control (Vercel)

- [ ] Conta Vercel criada
- [ ] Repositório conectado no Vercel
- [ ] Variável `NEXT_PUBLIC_MAESTRO_URL` configurada
- [ ] Deploy inicial executado
- [ ] Site acessível e funcionando
- [ ] WebSocket conectando ao Maestro

## 💻 Agent Listener (Cada PC)

### PC Principal
- [ ] Python 3.12+ instalado
- [ ] Ambiente virtual criado
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] Arquivo `.env` configurado
- [ ] `MAESTRO_URL` apontando para Oracle VPS
- [ ] Listener rodando (`python listener.py`)
- [ ] Listener aparecendo no Mission Control
- [ ] Heartbeat funcionando

### PC Trading
- [ ] Python 3.12+ instalado
- [ ] Ambiente virtual criado
- [ ] Dependências instaladas
- [ ] Arquivo `.env` configurado
- [ ] Listener rodando
- [ ] Aparecendo no Mission Control

### PC GPU
- [ ] Python 3.12+ instalado
- [ ] Ambiente virtual criado
- [ ] Dependências instaladas
- [ ] Arquivo `.env` configurado
- [ ] Listener rodando
- [ ] Aparecendo no Mission Control

## 📊 Netdata (Todos os Nodes)

### Oracle VPS
- [ ] Netdata instalado (via Docker Compose)
- [ ] Acessível em `https://metrics.{DOMAIN}`
- [ ] Conectado ao Netdata Cloud (opcional)

### PC Principal
- [ ] Netdata instalado
- [ ] Acessível em `http://localhost:19999`
- [ ] Conectado ao Netdata Cloud (opcional)

### PC Trading
- [ ] Netdata instalado
- [ ] Acessível em `http://localhost:19999`
- [ ] Conectado ao Netdata Cloud (opcional)

### PC GPU
- [ ] Netdata instalado
- [ ] Acessível em `http://localhost:19999`
- [ ] Conectado ao Netdata Cloud (opcional)

## 🔄 Watchtower (PCs Locais)

### PC Principal
- [ ] Watchtower instalado
- [ ] `GHCR_TOKEN` configurado (se usando GitHub Container Registry)
- [ ] Monitorando imagens corretas
- [ ] Auto-update funcionando

### PC GPU
- [ ] Watchtower instalado
- [ ] `GHCR_TOKEN` configurado
- [ ] Monitorando imagens corretas
- [ ] Auto-update funcionando

## 🔐 Segurança

- [ ] Infisical configurado e acessível
- [ ] Secrets migrados do `.env` para Infisical
- [ ] Tailscale VPN configurada (se usando)
- [ ] Firewall configurado (portas 80, 443 abertas)
- [ ] SSL funcionando (Let's Encrypt)
- [ ] Tokens JWT configurados

## 🧪 Testes

- [ ] Mission Control carrega agentes
- [ ] Heartbeat funcionando (status atualiza)
- [ ] Comando `restart` funciona
- [ ] Comando `stop` funciona
- [ ] Comando `screenshot` funciona
- [ ] Terminal remoto funciona
- [ ] Alertas de status crítico funcionam
- [ ] Netdata mostra métricas em tempo real
- [ ] Watchtower detecta novas imagens

## 📈 Monitoramento

- [ ] Netdata coletando métricas de todos os nodes
- [ ] Maestro logando eventos corretamente
- [ ] Agent Listeners logando corretamente
- [ ] Alertas configurados (Telegram/Discord)
- [ ] Dashboard Mission Control atualizando em tempo real

## 📚 Documentação

- [ ] `DEPLOYMENT.md` lido e entendido
- [ ] `ARQUITETURA_ARETE.md` lido e entendido
- [ ] `IMPLEMENTACAO_COMPLETA.md` lido
- [ ] READMEs de cada componente lidos

## 🎯 Validação Final

- [ ] Todos os agentes aparecem no Mission Control
- [ ] Status de todos os agentes é ONLINE
- [ ] Métricas sendo coletadas corretamente
- [ ] Comandos remotos funcionando
- [ ] Sistema operando 24/7 sem intervenção manual

---

## 🆘 Troubleshooting

Se algo não estiver funcionando:

1. **Agent não aparece no Mission Control**
   - Verificar se listener está rodando
   - Verificar `MAESTRO_URL` no `.env`
   - Verificar logs do listener
   - Verificar se Maestro está acessível

2. **Heartbeat não funciona**
   - Verificar conexão WebSocket
   - Verificar logs do Maestro
   - Verificar firewall/VPN

3. **Comandos não executam**
   - Verificar se agente está ONLINE
   - Verificar logs do listener
   - Verificar permissões do usuário

4. **Netdata não aparece**
   - Verificar se container está rodando
   - Verificar portas (19999)
   - Verificar logs: `docker logs netdata`

---

**Última atualização**: 22/01/2026  
**Versão**: 1.0.0

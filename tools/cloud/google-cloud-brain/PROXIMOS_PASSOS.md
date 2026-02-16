# 🚀 Próximos Passos - Corporação Senciente

## ✅ Fase 1: COMPLETA!

- ✅ Google Cloud Brain provisionado
- ✅ Portainer instalado e rodando
- ✅ Redis + Maestro deployados
- ✅ Imagem pública no GitHub Container Registry
- ✅ Stack rodando no Portainer

**Status**: 🟢 **Maestro operacional em http://100.78.145.65:8080**

---

## ✅ Fase 2: COMPLETA!

- ✅ Agent Listener conectado (pc-principal)
- ✅ Heartbeat e métricas (CPU, RAM, disco) funcionando
- ✅ Maestro registrando agente em `/agents`

**Status**: 🟢 **Listener validado em http://100.78.145.65:8080/agents**

---

## 📋 Fase 2 (referência): Conectar PCs Locais (Agent Listeners)

### Objetivo
Conectar seus PCs locais ao Maestro para controle remoto.

### Passo 1: Instalar Tailscale nos PCs Locais

1. Baixe e instale Tailscale: https://tailscale.com/download
2. Faça login com a mesma conta do Google Cloud Brain
3. Verifique conectividade:
   ```bash
   ping 100.78.145.65
   ```

### Passo 2: Configurar Agent Listener

**No seu PC local:**

1. Navegue até `agent-listener/`
2. Execute o setup:
   ```powershell
   # Windows
   .\setup.ps1
   ```
   
   ```bash
   # Linux/MacOS
   chmod +x setup.sh
   ./setup.sh
   ```

3. Configure `.env`:
   ```env
   MAESTRO_URL=http://100.78.145.65:8080
   AGENT_ID=pc-principal
   AGENT_NAME=PC Principal
   HEARTBEAT_INTERVAL=10
   RECONNECT_DELAY=5
   ```

4. Execute o listener:
   ```bash
   python listener.py
   ```

### Passo 3: Verificar Conexão

No Portainer, verifique os logs do Maestro:
- Deve aparecer: `agent_registered` com o ID do seu PC

---

## 📋 Fase 3: Mission Control Center (Frontend)

### Objetivo
Conectar o frontend (Vercel) ao Maestro para visualização e controle.

### Passo 1: Configurar Variável de Ambiente

No projeto Mission Control (Vercel):

1. Acesse: **Settings** → **Environment Variables**
2. Adicione: `NEXT_PUBLIC_MAESTRO_URL` = `http://100.78.145.65:8080` (Production)
3. **IMPORTANTE**: O browser precisa acessar o Maestro. Use **Tailscale** no dispositivo onde abre o dashboard (opção recomendada). Guia rápido: `mission-control/DEPLOY_FASE3.md`

### Passo 2: Deploy no Vercel

```bash
cd mission-control
vercel --prod
```

### Passo 3: Testar

1. Acesse o Mission Control
2. Deve aparecer os agentes conectados
3. Teste comandos remotos

---

## 📋 Fase 4: Integração Completa

### Checklist Final

- [ ] Agent Listeners rodando em todos os PCs
- [ ] Mission Control conectado ao Maestro
- [ ] Teste de heartbeat funcionando
- [ ] Teste de comandos remotos
- [ ] Teste de screenshots
- [ ] Monitoramento ativo

---

## 🔧 Troubleshooting

### Agent Listener não conecta

1. Verifique Tailscale:
   ```bash
   tailscale status
   ```

2. Teste conectividade:
   ```bash
   curl http://100.78.145.65:8080/health
   ```

3. Verifique logs do listener:
   ```bash
   python listener.py
   ```

### Mission Control não conecta

1. Verifique se `NEXT_PUBLIC_MAESTRO_URL` está configurado
2. Verifique se está conectado ao Tailscale (se acessando localmente)
3. Verifique console do navegador para erros

### Maestro não recebe heartbeats

1. Verifique logs do Maestro no Portainer
2. Verifique se Redis está rodando
3. Verifique conectividade Tailscale

---

## 📊 Arquitetura Final

```
┌─────────────────┐
│  Mission Control│
│   (Vercel)      │
└────────┬────────┘
         │ HTTP/WebSocket
         │ (via Tailscale)
         ▼
┌─────────────────┐
│  Google Cloud   │
│  Brain (Maestro)│
│  100.78.145.65  │
└────────┬────────┘
         │ Tailscale Mesh
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ PC 1   │ │ PC 2   │
│ Agent  │ │ Agent  │
└────────┘ └────────┘
```

---

**Status Atual**: 🟢 Fase 1 e 2 Completas
**Próxima Fase**: Mission Control (Vercel) — configurar `NEXT_PUBLIC_MAESTRO_URL` e deploy

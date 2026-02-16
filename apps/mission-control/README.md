# Mission Control - Corporacao Senciente

Centro de Controle Remoto da Corporação Senciente.

## Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + Radix UI
- **Auth**: Clerk (opcional)
- **Deploy**: Vercel

## Desenvolvimento

1. **Configurar Maestro URL** (dev local): crie `mission-control/.env.local`:
   ```env
   NEXT_PUBLIC_MAESTRO_URL=http://100.78.145.65:8080
   ```
   (Crie o arquivo se não existir; `.env.local` é ignorado pelo git.)

2. **Rodar em dev** (com Tailscale ativo no PC):
   ```bash
   npm install
   npm run dev
   ```
   Acesse `http://localhost:3000`. O dashboard chama o Maestro no browser; é preciso Tailscale para alcançar `100.78.145.65`.

3. **Build / Produção**:
   ```bash
   npm run build
   npm start
   ```

## Deploy na Vercel

### Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy producao
vercel --prod
```

### Via GitHub (recomendado)

1. Conecte o repositório no [Vercel Dashboard](https://vercel.com/dashboard)
2. **Root Directory**: `mission-control`
3. **Environment Variables** → Add:
   - **Name**: `NEXT_PUBLIC_MAESTRO_URL`
   - **Value**: `http://100.78.145.65:8080`
   - **Environment**: Production (e Preview se quiser)
4. Deploy. Após o deploy, acesse o Mission Control **só de um dispositivo com Tailscale ativo** (o browser precisa alcançar o IP do Maestro).

## Variaveis de Ambiente

| Variavel | Descricao | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_MAESTRO_URL` | URL da API Maestro via Tailscale | `http://100.78.145.65:8080` |

**Nota**: O Mission Control precisa estar na mesma rede Tailscale ou usar um proxy para acessar o Maestro. Em produção, considere usar um subdomínio Tailscale ou configurar um proxy reverso.

## Funcionalidades

- Dashboard de agentes em tempo real
- Status de heartbeat
- Metricas de CPU/RAM/Disco
- Comandos remotos (restart, stop, screenshot)
- Alertas de agentes criticos

## Arquitetura

```
Vercel (Mission Control)
    |
    | HTTPS via Tailscale
    v
Google Cloud Brain (Maestro)
    |
    | WebSocket (Tailscale Mesh)
    v
PCs Locais (Agent Listeners)
```

**Nota**: Toda comunicação acontece via Tailscale Mesh Network (Zero Trust). O Mission Control acessa o Maestro usando o IP Tailscale do Google Cloud Brain.

## Proximos Passos

- [ ] Integrar Clerk para autenticacao
- [ ] Terminal remoto via xterm.js
- [ ] Graficos de historico de metricas
- [ ] Notificacoes push via Web Push API

# 🚀 Mission Control – Fase 3 (Deploy rápido)

## Pré-requisitos

- Fase 1 e 2 OK (Maestro no ar, Agent Listener conectado)
- Conta Vercel e repositório conectado
- **Tailscale ativo** no PC onde você abre o Mission Control

## 1. Variáveis no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard) → seu projeto (ex.: `diana-corporacao-senciente`; se for só Mission Control, root: `mission-control`).
2. **Settings** → **Environment Variables** (ou use o [link direto](https://vercel.com/senciencycooporations-projects/diana-corporacao-senciente/settings/environment-variables)).
3. Clique em **Add Environment Variable** e preencha:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_MAESTRO_URL` | `http://100.78.145.65:8080` |

   **Environments**: Production (e Preview se quiser)
4. **Save**

## 2. Deploy

**Opção A – GitHub**

- Push para a branch ligada ao projeto → deploy automático.
- Ou **Deployments** → **Redeploy** após alterar env.

**Opção B – CLI**

```bash
cd mission-control
npm install
npx vercel --prod
```

Se usar o script: a partir da **raiz do repo**, execute `.\scripts\setup-vercel.ps1` para configurar `NEXT_PUBLIC_MAESTRO_URL` via CLI; depois faça o deploy.

## 3. Acesso

- Abra a URL do projeto (ex.: `https://mission-control-xxx.vercel.app`) **somente em um dispositivo com Tailscale ativo**.
- O browser precisa alcançar `100.78.145.65`; sem Tailscale o Maestro não será acessível.

## 4. Validar

- Dashboard mostra agentes (ex.: pc-principal).
- Status **ONLINE** quando o listener está rodando.
- Testar **Restart**, **Stop** ou **Screenshot** em um agente.

## Troubleshooting

| Problema | Verificar |
|----------|-----------|
| "Failed to fetch agents" | Tailscale ativo? `ping 100.78.145.65` e `curl http://100.78.145.65:8080/health` |
| Nenhum agente | Listener rodando? `Invoke-RestMethod http://100.78.145.65:8080/agents` |
| Env não aplicada | Redeploy após alterar variáveis no Vercel |

---

**Última atualização**: 22/01/2026

# ✅ Validação Fase 4 – Integração Completa

Checklist e comandos para validar o fluxo **Mission Control ↔ Maestro ↔ Agent Listeners**.

## Pré-requisitos

- Fase 1: Maestro no ar (Google Cloud Brain)
- Fase 2: Agent Listener configurado e **rodando**
- Fase 3: Mission Control deployado no Vercel com `NEXT_PUBLIC_MAESTRO_URL`
- **Tailscale ativo** no PC onde você abre o Mission Control e onde roda o listener

---

## 1. Subir o Agent Listener

Se o listener não estiver rodando, o agente fica OFFLINE/CRITICAL no Maestro.

```powershell
cd agent-listener
.\INICIAR.ps1
```

Deixe o terminal aberto. Em ~15 s o status deve voltar para **ONLINE**.

---

## 2. Validar Maestro e Agentes

Na raiz do repositório:

```powershell
.\TESTE_VALIDACAO.ps1
```

Ou use `.\CONTINUAR.ps1` para iniciar o listener (se necessário) e validar em seguida.

Ou manualmente:

```powershell
# Health
(Invoke-WebRequest -Uri "http://100.78.145.65:8080/health" -UseBasicParsing).Content

# Agentes (deve listar pc-principal com status ONLINE se listener estiver rodando)
(Invoke-WebRequest -Uri "http://100.78.145.65:8080/agents" -UseBasicParsing).Content
```

---

## 3. Mission Control (Vercel)

1. Acesse a URL do projeto (ex.: `https://mission-control-xxx.vercel.app`) **em um dispositivo com Tailscale ativo**.
2. Confira no dashboard:
   - Conexão com o Maestro (indicador verde)
   - Lista de agentes com **pc-principal** e status **ONLINE**
   - Métricas (CPU, RAM, disco) atualizando

---

## 4. Testar Comandos Remotos

No Mission Control, para o agente **pc-principal**:

| Comando     | O que faz                         | Como validar                          |
|------------|------------------------------------|---------------------------------------|
| **Restart** | Reinicia o listener               | Listener reinicia, agente volta em ~15s |
| **Stop**    | Para o listener                   | Agente fica OFFLINE                   |
| **Screenshot** | Captura a tela do PC do agente | Nova janela com a imagem              |
| **Terminal**   | Shell remoto                     | Digitar comando (ex. `whoami`) e ver saída |

---

## 5. Troubleshooting

| Problema | Verificar |
|----------|-----------|
| Agente CRITICAL/OFFLINE | Listener rodando? `.\INICIAR.ps1` em `agent-listener` |
| Mission Control não conecta | Tailscale ativo? `ping 100.78.145.65` |
| "Failed to fetch agents" | `NEXT_PUBLIC_MAESTRO_URL` no Vercel? Redeploy após alterar env |
| Comandos não executam | Listener conectado? Ver logs do listener no terminal |

---

## 6. Resumo da Validação

- [ ] Listener rodando (`.\INICIAR.ps1`)
- [ ] `.\TESTE_VALIDACAO.ps1` OK (Maestro + agentes)
- [ ] Mission Control abre e mostra agentes ONLINE
- [ ] Restart / Stop / Screenshot (ou Terminal) testados com sucesso

---

**Última atualização**: 2026-01-22

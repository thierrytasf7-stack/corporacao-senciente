# Protocolo de Autonomia Diana (Feedback Loop)

Este documento descreve a infraestrutura de feedback loop que permite ao "Cérebro" (Diana) comandar instâncias do Cursor (ARM) de forma 100% autônoma, com verificação de conclusão.

## 1. Arquitetura do Sistema

O sistema é composto por 4 pilares principais:

### 1.1. Daemon Bridge (`scripts/daemon/bridge_service.js`)

O "serviço de escuta" que roda na máquina local.

- **Polling**: Monitora a tabela `execution_queue` no Supabase.
- **Context Injection**: Antes de abrir o Cursor, gera arquivos `_AI_CONTEXT.md` e `.cursorrules` no repositório alvo.
- **Smart Delay**:
  - **Modo Tartaruga (30s)**: Se a janela do projeto não estiver aberta.
  - **Modo Relâmpago (3s)**: Se o processo do Cursor já estiver com a janela do projeto ativa.
- **Orquestração**: Abre o Cursor no diretório correto e chama o Automador Python.

### 1.2. Automator (`scripts/daemon/automator.py`)

Responsável pela interação direta com a UI do Windows/Cursor.

- **Focus Robusto**: Utiliza a API `ctypes` (user32.dll) para forçar a janela do Cursor para o primeiro plano, restaurando-a se estiver minimizada.
- **Sequence**: Aguarda o countdown -> Paste (Ctrl+V) -> Execute (Enter).

### 1.3. Feedback Pulse (`scripts/feedback_pulse.py`)

Script executado pela IA *dentro* da tarefa para sinalizar conclusão.

- **Signal**: Atualiza o status da tarefa para `completed` no Supabase.
- **Log**: Escreve o resultado no `result_log` para que o orquestrador saiba que pode prosseguir.

### 1.4. Orchestrator (`scripts/orchestrator_mixed_loop.js`)

O "maestro" que envia as ordens.

- **Sequence**: Envia tarefas em série.
- **Wait Logic**: Bloqueia a execução até receber o "Pulse" da tarefa anterior.
- **Multi-Repo**: Capaz de saltar entre o repositório do projeto e o repositório do "Cérebro".

## 2. Fluxo de Trabalho (Workflow Diana)

1. O Orquestrador envia uma tarefa `OPEN_CURSOR`.
2. O Daemon detecta, prepara o contexto e abre o Cursor.
3. O Daemon aguarda o tempo (3s ou 30s) e executa o Automador.
4. O Automador cola o prompt na IA do Cursor e dá Enter.
5. A IA do Cursor executa a tarefa (código, testes, git commit).
6. A IA do Cursor executa o `feedback_pulse.py`.
7. O Orquestrador detecta a conclusão e inicia o próximo passo.

## 3. Estado Atual

- ✅ Registro de Tarefas em Tempo Real.
- ✅ Foco de Janela Robusto (Windows).
- ✅ Smart Delay (Melhoria de Performance).
- ✅ Cross-Repository Agency (Cérebro <-> Projetos).

---

# Plano de Deploy Vercel

### Requisitos

- Repositório no GitHub (Conectado à Vercel).
- Variáveis de ambiente configuradas na Vercel:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Ajustes de Código

1. **Frontend**: Garantir que o Dashboard consuma os dados do Supabase.
2. **Proxy**: A Vercel servirá a UI do "Cérebro". O Daemon continuará rodando localmente (Bridge) conectando-se ao mesmo Supabase.

### Próximos Passos

1. Validar `npm run build`.
2. Configurar `vercel.json` se necessário.
3. Push para branch `main`.

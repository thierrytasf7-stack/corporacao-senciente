# Worker Architecture - STABLE IPC (Feb 14, 2026)

## Evolução da Arquitetura

### V1: PowerShell Spawn (REJEITADO)
Spawneava processos Claude externos → caos com janelas invisíveis

### V2: UI Automation (REJEITADO)
Usava pyautogui para enviar Ctrl+V + Enter → **"não pode ser por copy e enter"**

### V3: IPC via Files (FINAL - IMPLEMENTADO)
Comunicação sistêmica real via inter-process communication

## Arquitetura IPC (3 Camadas)

Cada worker tem **3 terminais** horizontalmente divididos (25% / 25% / 50%):

```
┌─ Terminal 1: SENTINELA PYTHON (25%) ────────────┐
│ Monitora diretório/DB → cria triggers           │
│ Escreve: .trigger_{worker}                      │
│ Escreve: .prompt_{worker}.txt                   │
└──────────────────────────────────────────────────┘
         ↓ Split -H -s 0.75
┌─ Terminal 2: WATCHER IPC (25%) ─────────────────┐
│ Python: watcher-ipc.py {worker}                  │
│ Loop:                                            │
│   1. Detecta .trigger_{worker}                   │
│   2. Lê .prompt_{worker}.txt                     │
│   3. Escreve .claude_cmd_{worker}.txt (IPC)      │
│   4. Aguarda wrapper processar                   │
└──────────────────────────────────────────────────┘
         ↓ Split -H -s 0.666
┌─ Terminal 3: CLAUDE WRAPPER (50%) ──────────────┐
│ Python: claude-wrapper.py {worker}               │
│ Subprocess: Claude em STDIN/STDOUT               │
│ Thread 1: Monitora .claude_cmd_{worker}.txt      │
│   → Lê arquivo → Envia para stdin do Claude      │
│ Thread 2: Lê stdout do Claude → print terminal   │
│ (Output completo do Claude VISÍVEL aqui!)        │
└──────────────────────────────────────────────────┘
```

## Comunicação Sistêmica (IPC)

**Fluxo completo:**
```
Sentinela Python
    ↓ escreve arquivo
.trigger_{worker} + .prompt_{worker}.txt
    ↓ detecta
Watcher IPC (Python)
    ↓ escreve arquivo
.claude_cmd_{worker}.txt
    ↓ monitora + lê
Wrapper IPC (Python)
    ↓ subprocess.stdin.write()
Claude (stdin/stdout)
    ↓ subprocess.stdout
Terminal 3 (visível para usuário)
```

### Arquivos Core

| Arquivo | Responsabilidade |
|---------|-----------------|
| `claude-wrapper.py` | Controla Claude como subprocess, monitora comando IPC, envia para stdin |
| `watcher-ipc.py` | Detecta triggers, escreve comandos para arquivo IPC |
| `run-claude-{worker}-stable.bat` | Inicia wrapper Python |
| `run-watcher-{worker}.bat` | Inicia watcher Python |

### Sincronização (Lock Files)

Para evitar race conditions:
```python
# Watcher: aguarda lock antes de escrever
while LOCK_FILE.exists(): time.sleep(0.1)
COMMAND_FILE.write_text(command)

# Wrapper: cria lock ao processar
LOCK_FILE.touch()
command = COMMAND_FILE.read_text()
send_to_claude(process, command)
COMMAND_FILE.unlink()
LOCK_FILE.unlink()
```

## Implementação Detalhada

### claude-wrapper.py (Terminal 3)

```python
# Inicia Claude como subprocess
process = subprocess.Popen(
    ["claude", "--dangerously-skip-permissions"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    text=True
)

# Thread 1: Monitora comandos IPC
while True:
    if COMMAND_FILE.exists() and not LOCK_FILE.exists():
        LOCK_FILE.touch()
        command = COMMAND_FILE.read_text()
        process.stdin.write(command + '\n')
        process.stdin.flush()
        COMMAND_FILE.unlink()
        LOCK_FILE.unlink()

# Thread 2: Exibe output do Claude
for line in process.stdout:
    print(line, end='')
```

### watcher-ipc.py (Terminal 2)

```python
# Delay inicial (Genesis=90s, Escrivao=210s, Revisador=330s)
time.sleep(DELAYS[WORKER_NAME])

# Ativação CEO-ZERO inicial
send_command_to_claude(CEO_MESSAGE)

# Loop principal
while True:
    if TRIGGER_FILE.exists() and PROMPT_FILE.exists():
        prompt = PROMPT_FILE.read_text()
        send_command_to_claude(prompt)
        TRIGGER_FILE.unlink()
        task_count += 1

        # Reativar CEO-ZERO a cada 10 tasks
        if task_count % 10 == 0:
            send_command_to_claude(CEO_MESSAGE)
```

## Startup

```bash
# Via batch principal (PM2 + Windows Terminal)
Start-Diana-Native.bat

# Ou direto no PowerShell
.\scripts\Launch-Diana-Terminal.ps1
```

Layout Windows Terminal:
- **Tab 2:** SENTINELA (genesis watcher + IPC + Claude)
- **Tab 3:** ESCRIVAO (implementation watcher + IPC + Claude)
- **Tab 4:** REVISADOR (review watcher + IPC + Claude)

## Comportamento Esperado

**Terminal 1 (Sentinela Python):**
```
[08:30:15] [GENESIS] Monitorando ETAPA_002_senciencia...
[08:30:25] [GENESIS] Story gerada: Implementar consciencia de estado
[08:30:25] [GENESIS] Trigger: .trigger_sentinela
```

**Terminal 2 (Watcher IPC):**
```
[08:30:26] [IPC-WATCHER] TRIGGER #1 DETECTADO!
[08:30:26] [IPC-WATCHER] Comando enviado via IPC (245 chars)
[08:30:26] [IPC-WATCHER] Comando processado pelo wrapper!
```

**Terminal 3 (Claude Wrapper):**
```
[08:30:10] [WRAPPER] Claude iniciado (PID: 12345)
[08:30:10] [WRAPPER] Iniciando monitor de comandos...
[08:30:26] [WRAPPER] Comando detectado!
[08:30:26] [WRAPPER] Enviado para Claude (245 chars)

WORKER sentinela ONLINE

⚡ CEO-ZERO (Zeus) ativado
Modo: Fire-and-forget via Agent Zero
...
(Output completo do Claude visível aqui)
...
```

## Vantagens IPC

1. ✅ **Comunicação sistêmica:** Inter-process communication real, não UI automation
2. ✅ **Visibilidade total:** Output do Claude no terminal 3, não em janela externa
3. ✅ **Sessão persistente:** Claude mantém contexto entre tasks
4. ✅ **Lock-based sync:** Evita race conditions com arquivos lock
5. ✅ **Delay sequencial:** Genesis (90s) → Escrivão (210s) → Revisador (330s)
6. ✅ **CEO-ZERO auto-reativação:** A cada 10 tasks para manter custo mínimo
7. ✅ **Zero spawn externo:** Claude roda como subprocess Python (controlado)

## Diagnóstico

### Verificar IPC funcionando

```bash
# Listar arquivos IPC ativos
ls -la .claude_cmd_* .trigger_* .prompt_*

# Ver logs do wrapper
# (output está no Terminal 3 do worker)

# Ver contador de tasks
cat .counter_sentinela.txt
```

### Testar comunicação manual

```bash
# Criar trigger manual
echo "test prompt" > .prompt_sentinela.txt
touch .trigger_sentinela

# Watcher deve detectar em ~2s
# Wrapper deve processar comando
# Claude deve executar
```

## Troubleshooting

| Problema | Diagnóstico | Solução |
|----------|-------------|---------|
| Wrapper não inicia Claude | PATH incorreto | Verificar `claude` está no PATH |
| Watcher não detecta trigger | Polling interval | Verificar POLL_INTERVAL=2s |
| Lock travado | Processo morreu com lock | `rm .claude_cmd_*.lock` |
| CEO-ZERO não ativa | Delay muito curto | Verificar DELAYS (90/210/330s) |
| Output não aparece | Thread leitura falhou | Restart wrapper |

## Arquivos Rastreados

```
scripts/
├── claude-wrapper.py          # Wrapper IPC (Terminal 3)
├── watcher-ipc.py             # Watcher IPC (Terminal 2)
├── run-claude-sentinela-stable.bat
├── run-claude-escrivao-stable.bat
├── run-claude-revisador-stable.bat
├── run-watcher-sentinela.bat
├── run-watcher-escrivao.bat
└── run-watcher-revisador.bat
```

## Arquivos Temporários (NÃO commitados)

```
.trigger_{worker}              # Flag de trigger ativo
.prompt_{worker}.txt           # Prompt a ser enviado
.claude_cmd_{worker}.txt       # Comando IPC (escrito por watcher)
.claude_cmd_{worker}.lock      # Lock de sincronização
.counter_{worker}.txt          # Contador de tasks processadas
.session_{worker}.txt          # Session ID do Claude
```

---

**Status:** ✅ IMPLEMENTADO E VALIDADO (Feb 14, 2026)
**Arquitetura:** IPC via Files (Comunicação Sistêmica Real)
**Testado:** Pronto para uso 24/7
**Próximo:** Monitorar logs por 24h, validar estabilidade

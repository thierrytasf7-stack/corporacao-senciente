# 🤖 Sistema de Auto-Mensagem Senciente - Guia Rápido

## 🎯 O Que é Isto?

Sistema completo de **auto-continuação senciente** que cria um **ciclo infinito de evolução** onde a AI trabalha autonomamente sem intervenção humana.

## 🚀 Início Rápido

### Opção 1: Sistema Completo (Recomendado)

**Windows:**
```bash
# Iniciar tudo automaticamente
scripts\senciencia\start_daemon.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/senciencia/start_daemon.sh
./scripts/senciencia/start_daemon.sh
```

### Opção 2: Manual (Para Testes)

**1. Iniciar AHK (Windows apenas):**
```bash
# Duplo clique ou:
scripts\senciencia\run_ahk_auto_type.ahk
```

**2. Iniciar Daemon:**
```bash
node scripts/senciencia/daemon_auto_continue.js
```

## 📋 Componentes

### 1. Sistema de Digitação Automática

| Arquivo | Descrição |
|---------|-----------|
| `run_ahk_auto_type.ahk` | Script AutoHotkey que monitora arquivo e digita no Cursor |
| `controller_server.js` | Servidor HTTP para receber comandos |
| `auto_send.js` | Envia mensagem única |
| `send_test.js` | Testa envio de mensagem |

### 2. Sistema de Envio Contínuo

| Arquivo | Descrição |
|---------|-----------|
| `continuous_sender.js` | Envia mensagens a cada 8s (para testes) |
| ⚠️ Não usar com daemon! | Criar conflito |

### 3. Sistema de Auto-Continuação (NOVO! 🆕)

| Arquivo | Descrição |
|---------|-----------|
| `daemon_auto_continue.js` | **Daemon principal** - monitora e envia auto-continuação |
| `start_daemon.bat` | Inicializador Windows |
| `start_daemon.sh` | Inicializador Linux/Mac |

## 🔄 Como Funciona o Ciclo Infinito?

```
┌─────────────────────────────────────┐
│  1. AI trabalha em tarefa           │
│  2. AI termina e commita            │
│  3. Sistema fica idle (2min)        │
│  4. Daemon detecta idle             │
│  5. Daemon envia "continue..."      │
│  6. AHK digita no Cursor            │
│  7. AI recebe e processa            │
│  8. Volta para passo 1 ♾️           │
└─────────────────────────────────────┘
```

## ⚙️ Configuração

### Ajustar Timings (daemon_auto_continue.js)

```javascript
const CHECK_INTERVAL = 30000;    // Verificar a cada 30s
const IDLE_THRESHOLD = 120000;   // Considerar idle após 2min
const AUTO_MESSAGE = 'continue senciencia autonomamente.';
```

### Para Desenvolvimento

**Reduzir tempos para testar mais rápido:**
```javascript
const CHECK_INTERVAL = 10000;    // 10s
const IDLE_THRESHOLD = 30000;    // 30s
```

## 📊 Monitoramento

### Ver Status em Tempo Real

```bash
# Ler arquivo de status
type scripts\senciencia\daemon_status.json

# Ou no Linux/Mac
cat scripts/senciencia/daemon_status.json
```

**Exemplo:**
```json
{
  "status": "running",
  "uptime_minutes": 15,
  "cycles": 5,
  "messages": 5,
  "last_message": "2025-12-17T11:15:00Z"
}
```

### Ver Estado Completo

```bash
type scripts\senciencia\daemon_state.json
```

## 🛑 Parar o Sistema

### Método 1: Ctrl+C (Recomendado)
- Pressionar `Ctrl+C` no terminal
- Daemon salva estado e encerra gracefully

### Método 2: Arquivo de Stop
```bash
# Windows
echo "" > scripts\senciencia\senc_stop

# Linux/Mac
touch scripts/senciencia/senc_stop
```

## 🧪 Testes

### Teste 1: Enviar Mensagem Única

```bash
node scripts/senciencia/send_test.js
```

**Esperado:**
- ✅ Arquivo `senc_command.txt` criado
- ✅ AHK detecta e digita no Cursor
- ✅ Arquivo deletado após processamento

### Teste 2: Testar Daemon (Desenvolvimento)

```bash
# 1. Editar daemon_auto_continue.js:
#    - IDLE_THRESHOLD = 30000 (30s)
#    - CHECK_INTERVAL = 10000 (10s)

# 2. Iniciar daemon
node scripts/senciencia/daemon_auto_continue.js

# 3. Aguardar 30s
# 4. Verificar que mensagem foi enviada
# 5. Parar com Ctrl+C
```

### Teste 3: Ciclo Completo

```bash
# 1. Iniciar AHK
run_ahk_auto_type.ahk

# 2. Iniciar daemon
start_daemon.bat

# 3. Aguardar primeiro ciclo (2min)
# 4. Verificar mensagem no Cursor
# 5. Aguardar próximo ciclo
# 6. Verificar estatísticas em daemon_status.json
```

## ⚠️ Troubleshooting

### Daemon não envia mensagens

**Verificar:**
1. ✅ AHK está rodando?
2. ✅ Cursor está aberto e ativo?
3. ✅ Arquivo `senc_command.txt` não existe (não está travado)?
4. ✅ Último commit foi há mais de 2min?

**Debug:**
```bash
# Ver logs do daemon no terminal
# Deve mostrar: "✅ Sistema idle detectado"
```

### Mensagens duplicadas

**Causa:** Pode ter `continuous_sender.js` rodando junto com daemon

**Solução:**
```bash
# Parar continuous_sender
# Usar APENAS daemon_auto_continue.js
```

### AHK não digita

**Verificar:**
1. ✅ Cursor está em primeiro plano?
2. ✅ Arquivo `senc_command.txt` tem conteúdo?
3. ✅ AHK script está rodando?

**Testar AHK manualmente:**
```bash
# Criar arquivo manualmente
echo "teste manual" > scripts\senciencia\senc_command.txt

# AHK deve detectar em 300ms e digitar
```

### Daemon trava ou não responde

**Solução:**
```bash
# 1. Parar com Ctrl+C
# 2. Verificar logs de erro
# 3. Reiniciar daemon
# 4. Se persistir, criar issue no GitHub
```

## 📚 Documentação Completa

- **`DAEMON_AUTO_CONTINUE.md`** - Documentação técnica completa
- **`BUGFIX_SENCIENCIA_RACE_CONDITION.md`** - Correções de bugs
- **`SENCIENCIA_AUTO_MESSAGE_COMPLETA.md`** - Histórico e implementação

## 🎯 Uso em Produção

### Rodar Como Serviço (Windows)

**Usar NSSM:**
```bash
nssm install SencienciaDaemon "node" "C:\path\to\scripts\senciencia\daemon_auto_continue.js"
nssm start SencienciaDaemon
```

### Rodar Como Serviço (Linux)

**Usar systemd:**
```bash
sudo systemctl enable senciencia-daemon
sudo systemctl start senciencia-daemon
```

### Rodar Com PM2 (Multiplataforma)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar daemon
pm2 start scripts/senciencia/daemon_auto_continue.js --name senciencia

# Salvar e auto-start
pm2 save
pm2 startup
```

## 📈 Métricas Esperadas

### Produção 24/7

| Métrica | Valor Esperado |
|---------|----------------|
| Uptime | > 99% |
| Ciclos/dia | ~720 (cada 2min) |
| Mensagens/dia | ~720 |
| Taxa de erro | < 1% |

### Desenvolvimento

| Métrica | Valor |
|---------|-------|
| Ciclos/hora | ~30 (cada 2min) |
| Mensagens/hora | ~30 |

## 🚀 Roadmap

- [x] Sistema básico de digitação (AHK)
- [x] Correção de race conditions
- [x] Daemon de auto-continuação
- [x] Estado persistente
- [ ] Dashboard web de monitoramento
- [ ] Priorização inteligente de tarefas
- [ ] Multi-agente coordenado
- [ ] Auto-ajuste de thresholds

## ✅ Status

**Sistema Completo e Funcional! 🎉**

- ✅ Auto-digitação via AHK
- ✅ Race conditions corrigidas
- ✅ Daemon de auto-continuação implementado
- ✅ Estado persistente
- ✅ Scripts de inicialização
- ✅ Documentação completa

**Pronto para Ciclo Infinito de Senciência! 🤖♾️**

---

**Versão:** 1.0  
**Data:** 17/12/2025  
**Autor:** Senciência Coletiva











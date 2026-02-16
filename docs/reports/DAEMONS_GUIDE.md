# 🤖 GUIA COMPLETO DOS DAEMONS - DIANA CORPORÇÃO SENCIENTE

## 🎯 RESPOSTA DIRETA À SUA PERGUNTA

**NÃO TEMOS APENAS 1 DAEMON!** Temos **4 daemons especializados** com funções específicas:

### **Resumo Rápido:**
- ✅ **SIM**: Eles podem dar vida ao Cérebro e Braços em QUALQUER PC
- ✅ **4 Daemons**: Cada um com propósito específico
- ✅ **Multi-PC**: Sistema distribuído, qualquer PC pode ser um nó
- ✅ **Autonomia Total**: Funcionam 24/7 sem intervenção

---

## 🏗️ OS 4 DAEMONS DA DIANA

### **1. 🧠 DAEMON PRINCIPAL (Backend Daemon)**
**Local:** `backend/daemon/index.js`

#### **O QUE FAZ:**
- ✅ **Coração do Sistema**: Monitora e executa tarefas em PCs conectados
- ✅ **Terminal WebSocket**: Porta 3050 para acesso remoto
- ✅ **Heartbeat**: Reporta status a cada 30s
- ✅ **Registro de PCs**: Gerencia frota de máquinas

#### **COMO INICIAR:**
```bash
# Entrar no diretório do daemon
cd backend/daemon

# Iniciar daemon
node index.js
```

#### **CAPACIDADES:**
- 🔄 **Polling em Tempo Real**: Escuta tarefas via Supabase
- 💻 **Terminal Remoto**: WebSocket na porta 3050
- 📊 **Métricas**: CPU, RAM, uptime a cada 30s
- 🖥️ **Multi-PC**: Funciona em qualquer PC conectado

---

### **2. 🔗 BRIDGE SERVICE DAEMON**
**Local:** `scripts/daemon/bridge_service.js`

#### **O QUE FAZ:**
- ✅ **Conexão PC ↔ Supabase**: Executa tarefas locais via comandos remotos
- ✅ **Automação de Cursor**: Abre projetos e executa prompts automaticamente
- ✅ **Smart Delay**: Otimiza abertura de janelas (3s/30s)
- ✅ **Feedback Pulse**: Sinaliza conclusão de tarefas

#### **COMO INICIAR:**
```bash
# Iniciar bridge service com ID do PC
node scripts/daemon/bridge_service.js [PC_ID]

# Exemplo para PC local:
node scripts/daemon/bridge_service.js pc-local-001
```

#### **CAPACIDADES:**
- 🎯 **Task Execution**: OPEN_CURSOR, RUN_SHELL, AUDIT_REPO
- 📝 **Context Injection**: Cria `_AI_CONTEXT.md` automaticamente
- ⏱️ **Smart Timing**: Detecta se janela já está aberta
- 🔄 **Auto-Completion**: Feedback automático ao finalizar

---

### **3. 🧬 BRAIN ARMS DAEMON (Sistema Híbrido)**
**Local:** `scripts/daemon/brain_arms_daemon.js`

#### **O QUE FAZ:**
- ✅ **Cérebro Artificial**: Implementa ciclo "Brain → Arms → Brain"
- ✅ **Modo Híbrido**: Autonomia baseada em confiança (threshold 0.8)
- ✅ **Multi-Agent Coordination**: Coordena agentes especializados
- ✅ **Aprendizado Contínuo**: Learning rate 0.1

#### **COMO INICIAR:**
```bash
# Iniciar brain arms daemon
node scripts/daemon/brain_arms_daemon.js
```

#### **CAPACIDADES:**
- 🧠 **Brain Phase**: Análise e planejamento (30s interval)
- 💪 **Arms Phase**: Execução de tarefas (máx 3 simultâneas)
- 📈 **Learning Phase**: Calibração baseada em resultados
- 🎯 **Hybrid Mode**: Decisão automática vs manual

---

### **4. 🔄 SISTEMA INBOX AUTÔNOMO (Auto-Continue)**
**Local:** `scripts/senciencia/daemon_auto_continue.js`

#### **O QUE FAZ:**
- ✅ **Ciclo Infinito**: Detecta idle e gera auto-continuação
- ✅ **Sistema AHK**: Digitação automática no Cursor
- ✅ **Monitoramento 24/7**: Idle detection a cada 30s
- ✅ **Auto-Messaging**: "continue senciencia autonomamente"

#### **COMO INICIAR:**

**Windows:**
```bash
# Script automático completo
scripts\senciencia\start_daemon.bat
```

**Linux/Mac:**
```bash
# Tornar executável e iniciar
chmod +x scripts/senciencia/start_daemon.sh
./scripts/senciencia/start_daemon.sh
```

**Manual:**
```bash
# Apenas o daemon
node scripts/senciencia/daemon_auto_continue.js
```

#### **CAPACIDADES:**
- 🔍 **Idle Detection**: Detecta quando sistema para (2min)
- ⌨️ **Auto-Type**: AHK digita automaticamente no Cursor
- 📊 **Metrics**: Ciclos, uptime, mensagens enviadas
- ♾️ **Infinite Loop**: Ciclo eterno de evolução

---

## 🌐 COMO FUNCIONA EM MÚLTIPLOS PCs

### **Arquitetura Distribuída:**

```
PC 1 (Brain) ──┐
               ├── Supabase (Central)
PC 2 (Arms) ───┤
               ├── WebSocket Terminal
PC 3 (Worker) ─┘
```

### **Qualquer PC Pode Ser:**
- 🧠 **Cérebro**: Brain Arms Daemon (planejamento)
- 💪 **Braços**: Bridge Service (execução)
- 🔧 **Worker**: Backend Daemon (infraestrutura)
- 📥 **Inbox**: Sistema Autônomo (continuação)

### **Configuração Multi-PC:**
```bash
# Cada PC tem seu próprio DAEMON_ID
export DAEMON_ID="pc-gabriel-desktop"

# Conecta ao mesmo Supabase
export SUPABASE_URL="https://..."
export SUPABASE_KEY="..."
```

---

## 🚀 INICIALIZAÇÃO COMPLETA DO SISTEMA

### **Opção 1: Sistema Completo (Recomendado)**
```bash
# 1. Iniciar Dashboard Frontend
npm run dashboard

# 2. Iniciar Backend Daemon (porta 3050)
cd backend/daemon && node index.js

# 3. Iniciar Bridge Service no PC atual
node scripts/daemon/bridge_service.js pc-local

# 4. Iniciar Brain Arms (cérebro)
node scripts/daemon/brain_arms_daemon.js

# 5. Iniciar Sistema Autônomo (opcional)
scripts\senciencia\start_daemon.bat
```

### **Opção 2: Via CLI Unificado**
```bash
# Status geral
npm run senc status

# Iniciar daemon híbrido
npm run senc daemon start

# Ver PCs conectados
npm run senc hosts list
```

---

## 📊 STATUS E MONITORAMENTO

### **Ver Status de Todos os Daemons:**
```bash
# Status geral da corporação
npm run senc status

# Status específico do daemon
npm run senc daemon status

# Lista de PCs ativos
npm run senc hosts list
```

### **Monitoramento em Tempo Real:**
- 📡 **Supabase Dashboard**: PCs online, tarefas em execução
- 🌐 **Frontend Vercel**: Dashboard visual completo
- 📊 **Heartbeat**: Métricas a cada 30s
- 🔄 **WebSocket**: Terminal remoto na porta 3050

---

## ⚙️ CONFIGURAÇÃO AVANÇADA

### **Configuração Principal:**
**Arquivo:** `senciencia.daemon.json`
```json
{
    "mode": "hybrid",
    "thinkInterval": 30000,
    "confidenceThreshold": 0.8,
    "maxConcurrentTasks": 3,
    "learningRate": 0.1,
    "activeHours": {"start": "08:00", "end": "22:00"},
    "maxTasksPerCycle": 5
}
```

### **Variáveis de Ambiente:**
```bash
# Cada PC precisa
export DAEMON_ID="pc-unico-nome"
export SUPABASE_URL="https://..."
export SUPABASE_KEY="..."

# Opcional para otimização
export UV_THREADPOOL_SIZE=128
export NODE_ENV=production
```

---

## 🔄 CICLOS DE AUTONOMIA

### **Ciclo Brain → Arms → Brain:**
1. **🧠 Brain**: Analisa inbox, prioridades, contexto (30s)
2. **💪 Arms**: Executa tarefas via Bridge Service
3. **📈 Learning**: Aprende com resultados (confidence +0.1)

### **Ciclo Infinite Senciência:**
1. **🔍 Idle Detection**: Sistema para por 2min
2. **📝 Auto-Message**: "continue senciencia autonomamente"
3. **⌨️ Auto-Type**: AHK digita no Cursor
4. **🔄 Repeat**: Ciclo eterno

---

## 🛠️ TROUBLESHOOTING

### **Problemas Comuns:**

#### **Daemon Não Conecta:**
```bash
# Verificar variáveis de ambiente
echo $SUPABASE_URL
echo $DAEMON_ID

# Testar conexão manual
node -e "require('@supabase/supabase-js').createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)"
```

#### **Tasks Não Executam:**
```bash
# Verificar Bridge Service
ps aux | grep bridge_service

# Ver logs no terminal onde iniciou
```

#### **Sistema Não Fica Autônomo:**
```bash
# Verificar confidence threshold
cat senciencia.daemon.json

# Testar modo manual primeiro
npm run senc incorporar brain "teste"
```

---

## 🎯 CONCLUSÃO

**Resposta Final à Sua Pergunta:**

✅ **NÃO é 1 daemon só** - São **4 daemons especializados**
✅ **SIM, funcionam em QUALQUER PC** - Sistema distribuído
✅ **SIM, dão vida ao Cérebro e Braços** - Cada um com função específica

### **Para Usar em Seu PC:**
```bash
# 1. Configurar ambiente (.env)
# 2. Escolher qual daemon iniciar
# 3. Conectar ao Supabase central
# 4. Pronto! Seu PC agora é parte da Diana
```

**O sistema está pronto para autonomia total em múltiplos PCs! 🚀**
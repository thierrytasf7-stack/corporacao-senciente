# AIOS-Core - Interfaces de Interação

## 🎯 Visão Geral

O AIOS-Core é **independente** e pode ser acessado através de **múltiplas interfaces**, sem depender de nenhuma ferramenta específica.

## 🔌 Interfaces Disponíveis

### 1. 💬 WhatsApp (Comunicação Natural)

**Descrição**: Interação via mensagens de texto através do WhatsApp Business API

**Como funciona**:
```
Usuário (WhatsApp) → Backend API → AIOS-Core → Resposta → WhatsApp
```

**Comandos disponíveis**:
- `/aios workflow list` - Listar workflows
- `/aios workflow run <nome>` - Executar workflow
- `/aios agent list` - Listar agentes
- `/aios status` - Status do sistema

**Implementação**:
```javascript
// backend/integrations/whatsapp/aios-handler.js
const { spawn } = require('child_process');

async function handleAIOSCommand(message) {
    const command = message.body.replace('/aios ', '');
    
    const aios = spawn('node', [
        '.aios-core/bin/aios-core.js',
        ...command.split(' ')
    ]);
    
    // Capturar output e enviar via WhatsApp
}
```

**Exemplo de uso**:
```
Usuário: /aios workflow run refactor-metricas
Bot: 🚀 Executando workflow: refactor-metricas
Bot: ✅ Task 1/4 concluída: refactor-05
Bot: ✅ Task 2/4 concluída: refactor-06
Bot: ✅ Workflow concluído com sucesso!
```

---

### 2. 🖥️ CLI (Aider / Claude Code)

**Descrição**: Interação via linha de comando usando Aider ou Claude Code CLI

**Como funciona**:
```bash
# Aider
aider --message "Execute o workflow refactor-metricas do AIOS-Core"

# Claude Code
claude-code "Run AIOS workflow refactor-metricas"
```

**Integração com Aider**:
```bash
# Aider pode chamar AIOS-Core diretamente
cd Diana-Corporacao-Senciente
aider --yes --message "node .aios-core/bin/aios-core.js workflow run refactor-metricas"
```

**Integração com Claude Code**:
```bash
# Claude Code pode executar comandos shell
claude-code --execute "node .aios-core/bin/aios-core.js workflow list"
```

**Comandos diretos**:
```bash
# Listar workflows
node .aios-core/bin/aios-core.js workflow list

# Executar workflow
node .aios-core/bin/aios-core.js workflow run refactor-metricas

# Listar agentes
node .aios-core/bin/aios-core.js agent list

# Ver configuração
node .aios-core/bin/aios-core.js config show
```

---

### 3. 🌐 Frontend (Mission Control)

**Descrição**: Interface web visual para gerenciar workflows e agentes

**Como funciona**:
```
Frontend (React) → Backend API → AIOS-Core → Resposta → Frontend
```

**Endpoints da API**:
```javascript
// backend/api/aios/routes.js

// GET /api/aios/workflows
// Lista todos os workflows disponíveis

// POST /api/aios/workflows/:name/run
// Executa um workflow específico

// GET /api/aios/workflows/:name/status
// Verifica status de execução

// GET /api/aios/agents
// Lista agentes disponíveis
```

**Componente Frontend**:
```jsx
// frontend/src/components/organisms/AIOSWorkflowPanel.jsx

function AIOSWorkflowPanel() {
    const [workflows, setWorkflows] = useState([]);
    
    const runWorkflow = async (name) => {
        const response = await fetch(`/api/aios/workflows/${name}/run`, {
            method: 'POST'
        });
        
        const result = await response.json();
        // Mostrar progresso em tempo real
    };
    
    return (
        <div>
            <h2>AIOS Workflows</h2>
            {workflows.map(w => (
                <WorkflowCard 
                    key={w.name}
                    workflow={w}
                    onRun={() => runWorkflow(w.name)}
                />
            ))}
        </div>
    );
}
```

**Tela no Mission Control**:
```
┌─────────────────────────────────────────┐
│ AIOS-Core Workflows                     │
├─────────────────────────────────────────┤
│                                         │
│ 📋 refactor-metricas                    │
│    Refatora documentos 05-08            │
│    Status: Ready                        │
│    [▶ Executar] [📊 Ver Logs]          │
│                                         │
│ 📋 generate-prds                        │
│    Gera PRDs automaticamente            │
│    Status: Ready                        │
│    [▶ Executar] [📊 Ver Logs]          │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🏗️ Arquitetura de Integração

```
┌─────────────────────────────────────────────────────────┐
│                    INTERFACES                           │
├──────────────┬──────────────┬──────────────────────────┤
│   WhatsApp   │     CLI      │       Frontend           │
│   Business   │  Aider/Code  │   Mission Control        │
└──────┬───────┴──────┬───────┴──────────┬───────────────┘
       │              │                  │
       │              │                  │
       ▼              ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Node.js/Python)               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  AIOS Integration Layer                         │   │
│  │  - Valida requisições                           │   │
│  │  - Gerencia autenticação                        │   │
│  │  - Enfileira tasks                              │   │
│  │  - Monitora execução                            │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   AIOS-Core (Independente)              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  CLI (bin/aios-core.js)                         │   │
│  │  - workflow list/run                            │   │
│  │  - agent list                                   │   │
│  │  - config show/set                              │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Agent Executor (cli/agents/agent-executor.js)  │   │
│  │  - Executa agentes LLM                          │   │
│  │  - Processa workflows                           │   │
│  │  - Valida resultados                            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Matriz de Funcionalidades por Interface

| Funcionalidade | WhatsApp | CLI | Frontend |
|----------------|----------|-----|----------|
| Listar workflows | ✅ | ✅ | ✅ |
| Executar workflow | ✅ | ✅ | ✅ |
| Ver status em tempo real | ✅ | ⚠️ | ✅ |
| Listar agentes | ✅ | ✅ | ✅ |
| Ver logs | ⚠️ | ✅ | ✅ |
| Configurar sistema | ❌ | ✅ | ✅ |
| Criar workflows | ❌ | ✅ | ✅ |
| Notificações push | ✅ | ❌ | ✅ |

**Legenda**:
- ✅ Suportado completamente
- ⚠️ Suportado parcialmente
- ❌ Não suportado

---

## 🔐 Autenticação e Segurança

### WhatsApp
```javascript
// Validar número autorizado
const authorizedNumbers = process.env.WHATSAPP_AUTHORIZED_NUMBERS.split(',');
if (!authorizedNumbers.includes(message.from)) {
    return sendMessage(message.from, '❌ Não autorizado');
}
```

### CLI
```bash
# Requer estar no diretório do projeto
# Valida .env com API keys
```

### Frontend
```javascript
// Requer autenticação JWT
// Valida permissões do usuário
const token = req.headers.authorization;
const user = verifyToken(token);
if (!user.permissions.includes('aios:execute')) {
    return res.status(403).json({ error: 'Forbidden' });
}
```

---

## 🚀 Exemplos de Uso por Interface

### WhatsApp
```
Usuário: /aios workflow list
Bot: 📋 Workflows disponíveis:
     • refactor-metricas
     • generate-prds
     • validate-architecture

Usuário: /aios workflow run refactor-metricas
Bot: 🚀 Iniciando workflow...
Bot: ✅ Task 1/4: refactor-05 (concluída)
Bot: ✅ Task 2/4: refactor-06 (concluída)
Bot: ✅ Task 3/4: refactor-07 (concluída)
Bot: ✅ Task 4/4: refactor-08 (concluída)
Bot: 🎉 Workflow concluído com sucesso!
```

### CLI (Aider)
```bash
$ aider

> Execute o workflow refactor-metricas do AIOS-Core

Aider: Executando comando...
$ node .aios-core/bin/aios-core.js workflow run refactor-metricas

🚀 AIOS-Core Workflow Executor
📋 Workflow: Refatorar Documentos METRICAS
✅ Task concluída: refactor-05
✅ Task concluída: refactor-06
✅ Task concluída: refactor-07
✅ Task concluída: refactor-08
📊 Relatório Final: 4/4 sucesso
```

### CLI (Direto)
```bash
$ cd Diana-Corporacao-Senciente
$ node .aios-core/bin/aios-core.js workflow list

📋 Workflows Disponíveis:

   • Refatorar Documentos METRICAS
     Arquivo: refactor-metricas.yaml
     Descrição: Refatora documentos 05-08 aplicando estrutura dos docs 01-02

$ node .aios-core/bin/aios-core.js workflow run refactor-metricas
[... execução ...]
```

### Frontend (Mission Control)
```
1. Acessar: https://mission-control.corporacao-senciente.com
2. Login com credenciais
3. Navegar para: AIOS > Workflows
4. Clicar em "refactor-metricas"
5. Clicar em "▶ Executar"
6. Acompanhar progresso em tempo real
7. Ver logs e resultados
```

---

## 📊 Fluxo de Dados

```
┌─────────────┐
│  Interface  │ (WhatsApp/CLI/Frontend)
└──────┬──────┘
       │
       │ 1. Requisição
       ▼
┌─────────────┐
│ Backend API │
└──────┬──────┘
       │
       │ 2. Validação + Autenticação
       ▼
┌─────────────┐
│  AIOS-Core  │
└──────┬──────┘
       │
       │ 3. Execução
       ▼
┌─────────────┐
│ Agent LLM   │ (Claude 3.5 Sonnet via OpenRouter)
└──────┬──────┘
       │
       │ 4. Resultado
       ▼
┌─────────────┐
│  AIOS-Core  │
└──────┬──────┘
       │
       │ 5. Validação + Salvamento
       ▼
┌─────────────┐
│ Backend API │
└──────┬──────┘
       │
       │ 6. Resposta
       ▼
┌─────────────┐
│  Interface  │
└─────────────┘
```

---

## 🎯 Decisão Arquitetural

**Princípio**: AIOS-Core é **independente** e **agnóstico de interface**

- ✅ Não depende de WhatsApp
- ✅ Não depende de Aider/Claude Code
- ✅ Não depende de Frontend
- ✅ Pode ser usado por qualquer interface via CLI ou API
- ✅ Interfaces são **camadas de acesso**, não dependências

**Benefícios**:
1. **Flexibilidade**: Adicionar novas interfaces sem modificar AIOS-Core
2. **Testabilidade**: Testar AIOS-Core isoladamente
3. **Manutenibilidade**: Atualizar interfaces sem afetar core
4. **Escalabilidade**: Múltiplas interfaces simultâneas

---

## 📝 Próximos Passos

1. ✅ AIOS-Core independente implementado
2. ⏳ Implementar endpoint `/api/aios/workflows` no backend
3. ⏳ Criar componente `AIOSWorkflowPanel` no frontend
4. ⏳ Adicionar comandos `/aios` no WhatsApp handler
5. ⏳ Documentar integração com Aider/Claude Code
6. ⏳ Criar testes de integração para cada interface

---

**Status**: ✅ Documentação completa das interfaces
**Atualizado**: 2026-02-02
**Autor**: Kiro Orchestrator

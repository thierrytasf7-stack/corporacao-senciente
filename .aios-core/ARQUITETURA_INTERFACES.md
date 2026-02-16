# Arquitetura de Interfaces - AIOS-Core

## 🎯 Princípio Fundamental

**AIOS-Core é o núcleo independente. Interfaces são camadas de acesso.**

```
┌─────────────────────────────────────────────────────────┐
│                  CAMADA DE INTERFACES                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ WhatsApp │  │   CLI    │  │      Frontend        │  │
│  │ Business │  │Aider/Code│  │  Mission Control     │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
└───────┼─────────────┼───────────────────┼───────────────┘
        │             │                   │
        └─────────────┼───────────────────┘
                      │
        ┌─────────────▼─────────────┐
        │    Backend Integration    │
        │  - Autenticação           │
        │  - Validação              │
        │  - Enfileiramento         │
        │  - Monitoramento          │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │      AIOS-Core (Núcleo)   │
        │  ✅ Independente          │
        │  ✅ Autônomo              │
        │  ✅ Agnóstico             │
        └───────────────────────────┘
```

## 🔌 Interface 1: WhatsApp

### Propósito
Permitir interação natural via mensagens de texto para usuários não-técnicos.

### Implementação
```javascript
// backend/integrations/whatsapp/aios-commands.js

const { spawn } = require('child_process');
const path = require('path');

class AIOSWhatsAppHandler {
    constructor() {
        this.aiosCLI = path.join(
            process.cwd(),
            '.aios-core/bin/aios-core.js'
        );
    }
    
    async handleCommand(message) {
        // Extrair comando
        const command = message.body.replace('/aios ', '');
        const args = command.split(' ');
        
        // Validar autorização
        if (!this.isAuthorized(message.from)) {
            return this.sendMessage(
                message.from,
                '❌ Você não tem permissão para usar AIOS-Core'
            );
        }
        
        // Executar AIOS-Core
        const result = await this.executeAIOS(args);
        
        // Enviar resposta
        return this.sendMessage(message.from, result);
    }
    
    async executeAIOS(args) {
        return new Promise((resolve, reject) => {
            const aios = spawn('node', [this.aiosCLI, ...args]);
            
            let output = '';
            
            aios.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            aios.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`AIOS-Core falhou: ${code}`));
                }
            });
        });
    }
    
    isAuthorized(phoneNumber) {
        const authorized = process.env.WHATSAPP_AUTHORIZED_NUMBERS
            .split(',')
            .map(n => n.trim());
        
        return authorized.includes(phoneNumber);
    }
    
    sendMessage(to, text) {
        // Implementação específica do WhatsApp Business API
        // ...
    }
}

module.exports = AIOSWhatsAppHandler;
```

### Comandos Disponíveis
```
/aios workflow list
/aios workflow run <nome>
/aios agent list
/aios status
/aios help
```

### Fluxo de Dados
```
WhatsApp → Backend → AIOS-Core → Resultado → Backend → WhatsApp
```

---

## 🖥️ Interface 2: CLI (Aider / Claude Code)

### Propósito
Permitir automação e integração com ferramentas de desenvolvimento.

### Implementação com Aider
```bash
# Aider pode executar comandos shell
aider --yes --message "node .aios-core/bin/aios-core.js workflow run refactor-metricas"

# Ou via script
aider --yes --file scripts/run-aios-workflow.sh
```

### Implementação com Claude Code
```bash
# Claude Code pode executar comandos
claude-code --execute "node .aios-core/bin/aios-core.js workflow list"

# Ou via prompt
claude-code "Execute o workflow refactor-metricas usando AIOS-Core"
```

### Script de Integração
```bash
#!/bin/bash
# scripts/run-aios-workflow.sh

WORKFLOW_NAME=$1

if [ -z "$WORKFLOW_NAME" ]; then
    echo "❌ Uso: ./run-aios-workflow.sh <workflow-name>"
    exit 1
fi

echo "🚀 Executando workflow: $WORKFLOW_NAME"

node .aios-core/bin/aios-core.js workflow run "$WORKFLOW_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Workflow concluído com sucesso"
else
    echo "❌ Workflow falhou"
    exit 1
fi
```

### Fluxo de Dados
```
Aider/Code → Shell → AIOS-Core → Resultado → Shell → Aider/Code
```

---

## 🌐 Interface 3: Frontend (Mission Control)

### Propósito
Interface visual para gerenciamento e monitoramento de workflows.

### Arquitetura Backend
```javascript
// backend/api/aios/routes.js

const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

// Middleware de autenticação
const authenticate = require('../middleware/auth');

// GET /api/aios/workflows
router.get('/workflows', authenticate, async (req, res) => {
    try {
        const result = await executeAIOS(['workflow', 'list']);
        res.json({ workflows: parseWorkflowList(result) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/aios/workflows/:name/run
router.post('/workflows/:name/run', authenticate, async (req, res) => {
    const { name } = req.params;
    
    try {
        // Executar em background
        const jobId = generateJobId();
        
        executeAIOSAsync(['workflow', 'run', name], jobId);
        
        res.json({
            jobId,
            status: 'running',
            message: `Workflow ${name} iniciado`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/aios/workflows/:name/status
router.get('/workflows/:name/status', authenticate, async (req, res) => {
    const { name } = req.params;
    
    // Verificar status do job
    const status = await getJobStatus(name);
    
    res.json(status);
});

// GET /api/aios/agents
router.get('/agents', authenticate, async (req, res) => {
    try {
        const result = await executeAIOS(['agent', 'list']);
        res.json({ agents: parseAgentList(result) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function executeAIOS(args) {
    return new Promise((resolve, reject) => {
        const aiosCLI = path.join(
            process.cwd(),
            '.aios-core/bin/aios-core.js'
        );
        
        const aios = spawn('node', [aiosCLI, ...args]);
        
        let output = '';
        
        aios.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        aios.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`AIOS-Core failed: ${code}`));
            }
        });
    });
}

module.exports = router;
```

### Arquitetura Frontend
```jsx
// frontend/src/components/organisms/AIOSWorkflowPanel.jsx

import React, { useState, useEffect } from 'react';
import { Card, Button, Progress, Alert } from '../atoms';
import { useAIOS } from '../../hooks/useAIOS';

export function AIOSWorkflowPanel() {
    const { workflows, runWorkflow, getStatus } = useAIOS();
    const [running, setRunning] = useState({});
    
    const handleRun = async (workflowName) => {
        setRunning(prev => ({ ...prev, [workflowName]: true }));
        
        try {
            const result = await runWorkflow(workflowName);
            
            // Polling de status
            const interval = setInterval(async () => {
                const status = await getStatus(workflowName);
                
                if (status.completed) {
                    clearInterval(interval);
                    setRunning(prev => ({ ...prev, [workflowName]: false }));
                }
            }, 2000);
            
        } catch (error) {
            console.error('Erro ao executar workflow:', error);
            setRunning(prev => ({ ...prev, [workflowName]: false }));
        }
    };
    
    return (
        <div className="aios-workflow-panel">
            <h2>AIOS-Core Workflows</h2>
            
            {workflows.map(workflow => (
                <Card key={workflow.name}>
                    <h3>{workflow.name}</h3>
                    <p>{workflow.description}</p>
                    
                    {running[workflow.name] ? (
                        <Progress indeterminate />
                    ) : (
                        <Button onClick={() => handleRun(workflow.name)}>
                            ▶ Executar
                        </Button>
                    )}
                </Card>
            ))}
        </div>
    );
}
```

### Hook Customizado
```javascript
// frontend/src/hooks/useAIOS.js

import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useAIOS() {
    const [workflows, setWorkflows] = useState([]);
    const [agents, setAgents] = useState([]);
    
    useEffect(() => {
        loadWorkflows();
        loadAgents();
    }, []);
    
    const loadWorkflows = async () => {
        const response = await api.get('/aios/workflows');
        setWorkflows(response.data.workflows);
    };
    
    const loadAgents = async () => {
        const response = await api.get('/aios/agents');
        setAgents(response.data.agents);
    };
    
    const runWorkflow = async (name) => {
        const response = await api.post(`/aios/workflows/${name}/run`);
        return response.data;
    };
    
    const getStatus = async (name) => {
        const response = await api.get(`/aios/workflows/${name}/status`);
        return response.data;
    };
    
    return {
        workflows,
        agents,
        runWorkflow,
        getStatus
    };
}
```

### Fluxo de Dados
```
Frontend → API → Backend → AIOS-Core → Resultado → Backend → API → Frontend
```

---

## 🔐 Segurança por Interface

### WhatsApp
- ✅ Validação de número autorizado
- ✅ Rate limiting por usuário
- ✅ Logging de comandos
- ✅ Sanitização de inputs

### CLI
- ✅ Requer acesso ao filesystem
- ✅ Validação de .env
- ✅ Permissões de execução
- ✅ Logging local

### Frontend
- ✅ Autenticação JWT
- ✅ Autorização por role
- ✅ CORS configurado
- ✅ Rate limiting por IP
- ✅ Audit log completo

---

## 📊 Comparação de Interfaces

| Aspecto | WhatsApp | CLI | Frontend |
|---------|----------|-----|----------|
| **Facilidade de uso** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Automação** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Visualização** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Tempo real** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Segurança** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Escalabilidade** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 Casos de Uso por Interface

### WhatsApp
- ✅ Executar workflows em movimento
- ✅ Receber notificações de conclusão
- ✅ Verificar status rapidamente
- ✅ Usuários não-técnicos

### CLI
- ✅ Automação em CI/CD
- ✅ Scripts de deployment
- ✅ Integração com Aider/Code
- ✅ Desenvolvimento local

### Frontend
- ✅ Gerenciamento visual
- ✅ Monitoramento em tempo real
- ✅ Análise de logs
- ✅ Configuração de workflows

---

## 📝 Decisões Arquiteturais

### 1. AIOS-Core é Independente
**Decisão**: AIOS-Core não depende de nenhuma interface específica.

**Razão**: Permite adicionar/remover interfaces sem afetar o núcleo.

### 2. Interfaces são Camadas
**Decisão**: Interfaces são camadas de acesso, não parte do core.

**Razão**: Separação de responsabilidades e testabilidade.

### 3. Backend como Integrador
**Decisão**: Backend gerencia autenticação, validação e enfileiramento.

**Razão**: Centralizar lógica de segurança e controle.

### 4. CLI como Padrão
**Decisão**: CLI é a interface primária, outras são wrappers.

**Razão**: Simplicidade, testabilidade e automação.

---

**Status**: ✅ Arquitetura de interfaces documentada
**Atualizado**: 2026-02-02
**Autor**: Kiro Orchestrator

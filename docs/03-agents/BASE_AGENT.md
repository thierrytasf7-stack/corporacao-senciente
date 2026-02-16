# BaseAgent - Interface Base para Agentes

## Visão Geral

`BaseAgent` é a classe base para todos os agentes do sistema. Define a interface comum que todos os agentes devem implementar, com suporte tanto para execução direta (compatibilidade) quanto para geração de prompts para incorporação no chat/IDE.

## Métodos Obrigatórios

### `execute(task, context)`
Executa tarefa em modo direto (compatibilidade com arquitetura antiga).

**Parâmetros:**
- `task` (string|object): Tarefa a executar
- `context` (object): Contexto adicional

**Retorna:** `Promise<object>` - Resultado da execução

**Nota:** Agentes específicos devem sobrescrever este método. A implementação base lança erro.

### `generatePrompt(task, context)`
Gera prompt estruturado para incorporar agente no chat/IDE.

**Parâmetros:**
- `task` (string|object): Tarefa a executar
- `context` (object): Contexto adicional (pode incluir `brainContext`, `agentHistory`)

**Retorna:** `Promise<string>` - Prompt estruturado

**Formato do Prompt:**
```
Você é o agente **[nome]** da Corporação Senciente 7.0.

## ESPECIALIZAÇÃO
[especialização]

## SETOR
[setor]

## FERRAMENTAS DISPONÍVEIS
- [lista de ferramentas]

## AGENTES QUE PODE CHAMAR
- [lista de agentes]

## TASK ESPECÍFICA
[task]

## CONTEXTO DO BRAIN
[contexto do Brain]

## HISTÓRICO DO AGENTE
[histórico recente]

## INSTRUÇÕES
[instruções de execução]
```

### `callAgent(agentName, subtask, context)`
Chama outro agente gerando prompt para incorporação.

**Parâmetros:**
- `agentName` (string): Nome do agente a chamar
- `subtask` (string|object): Subtarefa para o agente
- `context` (object): Contexto adicional

**Retorna:** `Promise<string>` - Prompt estruturado para incorporar o agente

**Validações:**
- Verifica se agente está em `canCallAgents`
- Valida via Router se disponível

### `getKnowledge(query)`
Busca conhecimento na memória corporativa.

**Parâmetros:**
- `query` (string): Query de busca

**Retorna:** `Promise<array>` - Conhecimento encontrado

### `registerDecision(decision, result)`
Registra decisão na memória compartilhada.

**Parâmetros:**
- `decision` (object): Decisão tomada
- `result` (object): Resultado da execução

**Retorna:** `Promise<boolean>` - Sucesso

## Configuração do Agente

### Estrutura de Config

```javascript
{
  name: 'agent_name',              // Obrigatório
  sector: 'Technical',             // Technical, Business, Operations
  specialization: 'Descrição...',   // Especialização do agente
  tools: ['write_file', 'search_replace'],  // Ferramentas disponíveis
  canCallAgents: ['agent1', 'agent2'],    // Agentes que pode chamar
  router: routerInstance,          // Injetado pelo Brain
  memory: memoryInstance          // Injetado pelo Brain
}
```

### Propriedades

- **name** (string, obrigatório): Nome único do agente
- **sector** (string): Setor do agente (Technical, Business, Operations)
- **specialization** (string): Descrição da especialização
- **tools** (array): Lista de ferramentas disponíveis
- **canCallAgents** (array): Lista de agentes que pode chamar
- **router** (object): Router para roteamento (injetado)
- **memory** (object): Memory para memória compartilhada (injetado)

## Exemplo de Uso

### Criando um Agente Específico

```javascript
import { BaseAgent } from './base_agent.js';

class MarketingAgent extends BaseAgent {
    constructor(config) {
        super({
            name: 'marketing',
            sector: 'Business',
            specialization: 'Estratégia de marketing, campanhas, publicidade, SEO',
            tools: ['write_file', 'read_file', 'codebase_search'],
            canCallAgents: ['copywriting', 'sales', 'finance'],
            ...config
        });
    }

    async execute(task, context = {}) {
        // Implementação específica do Marketing Agent
        // ...
    }

    async generatePrompt(task, context = {}) {
        // Personalizar prompt se necessário
        const basePrompt = await super.generatePrompt(task, context);
        
        // Adicionar contexto específico de marketing
        const marketingContext = `
## CONTEXTO DE MARKETING
- Campanhas ativas: [lista]
- Métricas recentes: [dados]
        `;
        
        return basePrompt + marketingContext;
    }
}
```

### Usando o Agente

```javascript
// Registrar no Brain
const brain = getBrain();
const marketingAgent = new MarketingAgent({
    router: brain.router,
    memory: brain.memory
});
brain.registerAgent(marketingAgent);

// Gerar prompt para incorporação
const prompt = await marketingAgent.generatePrompt(
    'Criar campanha de marketing para novo produto',
    { brainContext: { analysis: '...', reasoning: '...' } }
);

// Chamar outro agente
const copyPrompt = await marketingAgent.callAgent(
    'copywriting',
    'Criar copy para campanha',
    { campaign: '...' }
);
```

## Ferramentas Disponíveis

Ferramentas padrão do chat/IDE:
- `write_file`: Criar ou modificar arquivos
- `search_replace`: Modificar código existente
- `read_file`: Ler arquivos
- `list_dir`: Listar diretórios
- `grep`: Buscar padrões em arquivos
- `run_terminal_cmd`: Executar comandos no terminal
- `codebase_search`: Busca semântica no código

## Validação

O método `validateConfig()` valida a configuração do agente:
- Nome obrigatório
- Aviso se não tem especialização

---

**Última Atualização**: 2025-01-XX
**Status**: Interface base implementada




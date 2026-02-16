# Protocolo de Chamada Agent-to-Agent

Documentação do protocolo de comunicação entre agentes via prompts na Corporação Senciente 7.0.

## Visão Geral

O protocolo permite que agentes se comuniquem entre si gerando prompts estruturados que são incorporados no chat/IDE. Isso mantém a arquitetura Chat/IDE onde agentes não executam código diretamente, mas geram prompts para o chat incorporar.

## Como Funciona

### 1. Chamada de Agente

Quando um agente A precisa chamar um agente B:

```javascript
const prompt = await agentA.callAgent('agentB', 'Subtask description', { context });
```

### 2. Validação de Permissões

O sistema valida:
- Se `agentA.canCallAgents` inclui `agentB`
- Se o Router permite a chamada (se disponível)
- Se há loops infinitos detectados
- Se a profundidade máxima foi atingida

### 3. Geração de Prompt

O método `callAgent()` gera um prompt estruturado que:
- Identifica o agente chamado
- Inclui a subtask
- Inclui contexto da chamada (caller, depth, history)
- Pode gerar prompt completo se a instância do agente estiver disponível

### 4. Incorporação no Chat

O prompt gerado é incorporado no chat/IDE via `ChatInterface`, que:
- Incorpora o agente chamado usando `Agent Prompt Generator`
- Executa a subtask
- Retorna resultado para o agente chamador

## Rastreamento de Chamadas

### AgentCallTracker

O `AgentCallTracker` rastreia todas as chamadas para:
- Detectar loops infinitos
- Limitar profundidade máxima (padrão: 10)
- Coletar estatísticas
- Manter histórico de chamadas

### Detecção de Loops

O sistema detecta:
- **Loops diretos**: A → B → A na mesma cadeia
- **Chamadas repetidas**: Mesmo par chamado múltiplas vezes na mesma profundidade
- **Profundidade máxima**: Chamadas além do limite (padrão: 10)

## Timeout

Chamadas têm timeout configurável (padrão: 30 segundos) para evitar travamentos.

## Exemplo de Uso

```javascript
// Marketing Agent chama Copywriting Agent
const marketing = new MarketingAgent();
const prompt = await marketing.callAgent(
    'copywriting',
    'Criar copy para campanha de lançamento',
    {
        campaignType: 'launch',
        targetAudience: 'developers'
    }
);

// Prompt gerado será incorporado no chat
// Copywriting Agent executa e retorna resultado
```

## Formato do Prompt Gerado

```
@agent:copywriting
Task: Criar copy para campanha de lançamento
Context: {"campaignType":"launch","targetAudience":"developers","caller":"marketing","depth":1}
Caller: marketing
Depth: 1
```

Ou, se a instância do agente estiver disponível:

```
## CHAMADA AGENT-TO-AGENT
**Chamador:** marketing
**Agente Chamado:** copywriting
**Contexto da Chamada:** {...}

---

[Prompt completo do Copywriting Agent]

---

## RETORNO PARA MARKETING
Após executar a task acima, retorne o resultado estruturado para o agente marketing.
```

## Validação de Permissões

Cada agente define `canCallAgents` no construtor:

```javascript
constructor() {
    super({
        name: 'marketing',
        canCallAgents: ['copywriting', 'sales', 'finance']
    });
}
```

Tentativas de chamar agentes não permitidos resultam em erro.

## Estatísticas

O `AgentCallTracker` fornece estatísticas:

```javascript
const tracker = getGlobalTracker();
const stats = tracker.getStats();
// {
//   totalCalls: 100,
//   uniqueAgents: 15,
//   callsByAgent: { copywriting: 20, finance: 15, ... },
//   mostCalled: 'copywriting'
// }
```

## Limitações

- **Profundidade máxima**: 10 níveis (configurável)
- **Timeout**: 30 segundos por chamada (configurável)
- **Histórico**: Últimas 1000 chamadas mantidas

## Testes

Execute os testes do protocolo:

```bash
node scripts/test_agent_to_agent.js
```

## Referências

- **BaseAgent**: `scripts/agents/base_agent.js`
- **AgentCallTracker**: `scripts/agents/agent_call_tracker.js`
- **Agent Prompt Generator**: `scripts/swarm/agent_prompt_generator.js`
- **Arquitetura Chat/IDE**: `docs/02-architecture/CHAT_IDE_ARCHITECTURE.md`

---

**Última Atualização**: 2025-01-XX
**Status**: ✅ Implementado e Testado



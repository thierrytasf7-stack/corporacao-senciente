# Brain Prompt Generator

## Visão Geral

O Brain Prompt Generator é responsável por gerar prompts estruturados do Brain para incorporação no chat/IDE. Ele consolida contexto completo (Protocolo L.L.B., memória, conhecimento) e delega tasks para agentes apropriados.

## Funcionalidades

### 1. Busca Contexto Completo

O Brain Prompt Generator busca contexto de múltiplas fontes:

- **Protocolo L.L.B.** (via `context_awareness_protocol.js`):
  - **Letta**: Estado atual de evolução
  - **LangMem**: Sabedoria arquitetural e regras
  - **ByteRover**: Contexto do código atual
- **Memory**: Decisões similares e conhecimento corporativo
- **Router**: Encontra melhor agente para a task

### 2. Geração de Prompt Estruturado

O prompt gerado inclui:

- **Contexto Completo**: Estado, sabedoria, memória
- **Análise da Task**: Análise detalhada pelo Brain
- **Delegação**: Agente selecionado com razão
- **Instruções**: Como incorporar o agente no chat

## Formato do Prompt

```
Você é o **Brain** da Corporação Senciente 7.0...

## CONTEXTO COMPLETO
### Estado Atual (Letta)
### Sabedoria Arquitetural (LangMem)
### Decisões Similares (Memória)
### Contexto do Sistema

## TASK PRINCIPAL
[task]

## ANÁLISE DO BRAIN
### Agente Selecionado
### Orquestração (se necessário)
### Alternativas Consideradas

## DELEGAÇÃO
O melhor agente para esta task é: [agente]

## INSTRUÇÕES PARA O CHAT
[instruções]
```

## Uso

### Exemplo Básico

```javascript
import { getBrainPromptGenerator } from './swarm/brain_prompt_generator.js';

const generator = getBrainPromptGenerator();
const prompt = await generator.generateBrainPrompt(
    'Criar nova feature de autenticação',
    { priority: 'high' }
);

console.log(prompt);
```

### Integração com Chat Interface

```javascript
import { getBrainPromptGenerator } from './swarm/brain_prompt_generator.js';
import { getChatInterface } from './swarm/chat_interface.js';

const generator = getBrainPromptGenerator();
const chatInterface = getChatInterface();

// Gerar prompt
const prompt = await generator.generateBrainPrompt(task, context);

// Incorporar no chat
const result = await chatInterface.incorporate(prompt);
```

## Métodos

### `generateBrainPrompt(task, context)`

Gera prompt estruturado do Brain.

**Parâmetros:**
- `task` (string|object): Tarefa a processar
- `context` (object): Contexto adicional

**Retorna:** `Promise<string>` - Prompt estruturado

**Fluxo:**
1. Busca contexto via Protocolo L.L.B.
2. Busca memória (decisões similares, conhecimento)
3. Usa Router para encontrar melhor agente
4. Constrói prompt estruturado

## Integração com Protocolo L.L.B.

### Estado Atual (Letta)
- Última atividade
- Decisões pendentes
- Agentes ativos

### Sabedoria Arquitetural (LangMem)
- Regras imutáveis
- Padrões técnicos
- Grafos de dependência

### Contexto do Código (ByteRover)
- Mudanças recentes
- Impacto visual
- Linha do tempo evolutiva

## Tratamento de Erros

Se houver erro na geração do prompt:
- Retorna prompt de fallback básico
- Loga erro para diagnóstico
- Continua funcionamento (graceful degradation)

## Próximos Passos

Na Fase 2.2.7, o Brain Prompt Generator será atualizado para usar diretamente o Protocolo L.L.B. (LangMem, Letta, ByteRover) em vez de `context_awareness_protocol.js`.

---

**Última Atualização**: 2025-01-XX
**Status**: Implementado, aguardando integração com Protocolo L.L.B.



